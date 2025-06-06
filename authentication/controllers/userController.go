package controllers

import (
	"fmt"
	"math/rand"
	"net/http"
	"strings"
	"time"

	"github.com/erneap/models/v2/svcs"
	"github.com/erneap/models/v2/users"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func Login(c *gin.Context) {
	var data users.AuthenticationRequest

	if err := c.ShouldBindJSON(&data); err != nil {
		svcs.CreateDBLogEntry("authenticate", "DEBUG", "Login Error", "",
			fmt.Sprintf("Data Binding: %s", err.Error()), c)
		c.JSON(http.StatusBadRequest,
			users.AuthenticationResponse{Token: "", Exception: "Trouble with request"})
		return
	}

	user, err := svcs.GetUserByEMail(data.EmailAddress)
	if err != nil {
		msg := "Email Address/Password mismatch"
		svcs.CreateDBLogEntry("authenticate", "DEBUG", "Login Error", "",
			fmt.Sprintf("User Not Found: %s", data.EmailAddress), c)
		c.JSON(http.StatusNotFound,
			users.AuthenticationResponse{Token: "",
				Exception: msg})
		return
	}

	if err := user.Authenticate(data.Password); err != nil {
		svcs.UpdateUser(*user)
		svcs.CreateDBLogEntry("authenticate", "UNAUTHORIZED", "Login", "",
			fmt.Sprintf("Password Mismatch: %s", data.EmailAddress), c)
		c.JSON(http.StatusUnauthorized,
			users.AuthenticationResponse{
				Token: "", Exception: err.Error()})
		return
	}
	err = svcs.UpdateUser(*user)
	if err != nil {
		svcs.CreateDBLogEntry("authenticate", "ERROR", "Login", "",
			fmt.Sprintf("User Update Problem: %s", err.Error()), c)
		c.JSON(http.StatusNotFound,
			users.AuthenticationResponse{
				Token: "", Exception: "Problem Updating Database"})
		return
	}

	// create token
	tokenstring, err := svcs.CreateToken(user.ID, user.EmailAddress)
	if err != nil {
		msg := "CreateToken Problem: " + err.Error()
		svcs.CreateDBLogEntry("authenticate", "ERROR", "Login", "",
			fmt.Sprintf("Create Token Problem: %s", err.Error()), c)
		c.JSON(http.StatusNotFound,
			users.AuthenticationResponse{Token: "",
				Exception: msg})
		return
	}

	msg := fmt.Sprintf("User Login: %s logged into %s at %s", user.GetLastFirst(),
		data.Application, time.Now().Format("01/02/06 15:04"))
	svcs.CreateDBLogEntry("authenticate", "SUCCESS", "Login", "", msg, c)

	c.JSON(http.StatusOK, users.AuthenticationResponse{
		Token:     tokenstring,
		User:      *user,
		Exception: "",
	})
}

func RenewToken(c *gin.Context) {
	tokenString := c.GetHeader("Authorization")
	claims, err := svcs.ValidateToken(tokenString)
	if err != nil {
		svcs.CreateDBLogEntry("authenticate", "ERROR", "Login", "",
			fmt.Sprintf("Renew Token Problem: %s", err.Error()), c)
		c.JSON(http.StatusBadRequest, users.AuthenticationResponse{
			Token:     "",
			Exception: err.Error(),
		})
	}

	// replace token by passing a new token in the response header
	id, _ := primitive.ObjectIDFromHex(claims.UserID)
	tokenString, _ = svcs.CreateToken(id, claims.EmailAddress)

	c.JSON(http.StatusOK, users.AuthenticationResponse{
		Token:     tokenString,
		Exception: "",
	})
}

func Logout(c *gin.Context) {
	id := c.Param("userid")
	app := c.Param("applicaition")

	fmt.Printf("%s/%s logging out\n", id, app)
	user, err := svcs.GetUserByID(id)
	if err != nil {
		msg := "GetUserByEmail Problem: " + err.Error()
		svcs.CreateDBLogEntry("authenticate", "ERROR", "Logout", "", msg, c)
		c.JSON(http.StatusNotFound, users.ExceptionResponse{Exception: err.Error()})
		return
	}

	msg := fmt.Sprintf("User Logout: %s logged out of %s at %s", user.GetLastFirst(),
		app, time.Now().Format("01/02/06 15:04"))
	svcs.CreateDBLogEntry("authenticate", "LOGOUT", "Login", "", msg, c)
	c.Status(http.StatusOK)
}

func UpdateUser(c *gin.Context) {
	var data users.UpdateRequest

	if err := c.ShouldBindJSON(&data); err != nil {
		svcs.CreateDBLogEntry("authenticate", "DEBUG", "UpdateUser", "",
			fmt.Sprintf("Data Binding: %s", err.Error()), c)
		c.JSON(http.StatusBadRequest,
			users.UserResponse{User: users.User{}, Exception: "Trouble with request"})
		return
	}

	user, err := svcs.GetUserByID(data.ID)
	if err != nil {
		msg := "GetUserByID Problem: " + err.Error()
		svcs.CreateDBLogEntry("authenticate", "DEBUG", "UpdateUser", "", msg, c)
		c.JSON(http.StatusNotFound, users.ExceptionResponse{Exception: msg})
		return
	}

	switch strings.ToLower(data.Field) {
	case "password":
		user.SetPassword(data.Value)
		user.ResetToken = ""
		user.BadAttempts = 0
	case "first", "firstname":
		user.FirstName = data.Value
	case "middle", "middlename":
		user.MiddleName = data.Value
	case "last", "lastname":
		user.LastName = data.Value
	case "email", "emailaddress":
		user.EmailAddress = data.Value
	case "unlock":
		user.BadAttempts = 0
	case "5days":
		user.BadAttempts = 0
		user.PasswordExpires = time.Now().UTC().AddDate(0, 0, 5)
	case "addperm", "addworkgroup", "addpermission":
		found := false
		for _, perm := range user.Workgroups {
			if strings.EqualFold(perm, data.Value) {
				found = true
			}
		}
		if !found {
			user.Workgroups = append(user.Workgroups, strings.ToLower(data.Value))
		}
	case "removeworkgroup", "remove", "removeperm", "removepermission":
		pos := -1
		for i, perm := range user.Workgroups {
			if strings.EqualFold(perm, data.Value) {
				pos = i
			}
		}
		if pos >= 0 {
			user.Workgroups = append(user.Workgroups[:pos],
				user.Workgroups[pos+1:]...)
		}
	}

	err = svcs.UpdateUser(*user)
	if err != nil {
		msg := "UpdateUser Problem: " + err.Error()
		svcs.CreateDBLogEntry("authenticate", "Debug", "UpdateUser", "", msg, c)
		c.JSON(http.StatusBadRequest, users.ExceptionResponse{Exception: msg})
		return
	}

	if strings.EqualFold(data.Field, "password") {
		svcs.CreateDBLogEntry("authenticate", "UPDATE", "UpdateUser", "",
			fmt.Sprintf("Update: %s = %s", data.Field, "XXXXXXXX"), c)
	} else {
		svcs.CreateDBLogEntry("authenticate", "UPDATE", "UpdateUser", "",
			fmt.Sprintf("Update: %s = %s", data.Field, data.Value), c)
	}
	c.JSON(http.StatusOK, users.UserResponse{User: *user, Exception: ""})
}

func AddUser(c *gin.Context) {
	var data users.AddUserRequest

	if err := c.ShouldBindJSON(&data); err != nil {
		svcs.CreateDBLogEntry("authenticate", "Debug", "AddUser", "",
			fmt.Sprintf("Data Binding Problem: %s", err.Error()), c)
		c.JSON(http.StatusBadRequest,
			users.UserResponse{User: users.User{}, Exception: "Trouble with request"})
		return
	}

	user := svcs.CreateUser(data.EmailAddress, data.FirstName,
		data.MiddleName, data.LastName, data.Password)
	if len(data.Permissions) <= 0 {
		switch strings.ToLower(data.Application) {
		case "metrics":
			user.Workgroups = append(user.Workgroups, "metrics-geoint")
		case "scheduler":
			user.Workgroups = append(user.Workgroups, "scheduler-employee")
		default:
			user.Workgroups = append(user.Workgroups, "default-employee")
		}
	} else {
		for _, perm := range data.Permissions {
			if !strings.Contains(perm, strings.ToLower(data.Application)) {
				perm = strings.ToLower(data.Application) + "-" + strings.ToLower(perm)
			}
			user.Workgroups = append(user.Workgroups, perm)
		}
	}
	err := svcs.UpdateUser(*user)
	if err != nil {
		svcs.CreateDBLogEntry("authenticate", "Debug", "AddUser", "",
			fmt.Sprintf("UserUser Problem: %s", err.Error()), c)
		c.JSON(http.StatusBadRequest,
			users.UserResponse{User: users.User{}, Exception: "Trouble with request"})
		return
	}

	svcs.CreateDBLogEntry("authenticate", "CREATE", "AddUser", "",
		fmt.Sprintf("User Created: %s", data.EmailAddress), c)
	c.JSON(http.StatusOK, users.UserResponse{User: *user, Exception: ""})
}

func DeleteUser(c *gin.Context) {
	id := c.Param("userid")

	err := svcs.DeleteUser(id)
	if err != nil {
		msg := "DeleteUser Problem: " + err.Error()

		svcs.CreateDBLogEntry("authenticate", "Debug", "DeleteUser", "", msg, c)
		c.JSON(http.StatusBadRequest, users.ExceptionResponse{Exception: msg})
		return
	}
	usrs, err := svcs.GetUsers()
	if err != nil {
		msg := "GetUsers Problem: " + err.Error()

		svcs.CreateDBLogEntry("authenticate", "Debug", "GetUsers", "", msg, c)
		c.JSON(http.StatusBadRequest, users.ExceptionResponse{Exception: msg})
		return
	}
	svcs.CreateDBLogEntry("authenticate", "DELETE", "DeleteUser", "",
		fmt.Sprintf("User Deleted: %s", id), c)
	c.JSON(http.StatusOK, users.UsersResponse{Users: usrs, Exception: ""})
}

func GetUser(c *gin.Context) {
	id := c.Param("userid")

	user, err := svcs.GetUserByID(id)
	if err != nil {
		msg := "GetUser Problem: " + err.Error()

		svcs.CreateDBLogEntry("authenticate", "Debug", "GetUser", "", msg, c)
		c.JSON(http.StatusBadRequest, users.ExceptionResponse{Exception: msg})
		return
	}
	c.JSON(http.StatusOK, users.UserResponse{User: *user, Exception: ""})
}

func GetUsers(c *gin.Context) {

	usrs, err := svcs.GetUsers()
	if err != nil {
		msg := "GetUsers Problem: " + err.Error()

		svcs.CreateDBLogEntry("authenticate", "Debug", "GetUsers", "", msg, c)
		c.JSON(http.StatusBadRequest, users.ExceptionResponse{Exception: msg})
		return
	}
	c.JSON(http.StatusOK, users.UsersResponse{Users: usrs, Exception: ""})
}

func StartPasswordReset(c *gin.Context) {
	var data users.AuthenticationRequest

	if err := c.ShouldBindJSON(&data); err != nil {
		svcs.CreateDBLogEntry("authenticate", "Debug", "StartPasswordReset", "",
			fmt.Sprintf("Data Binding Problem: %s", err.Error()), c)
		c.JSON(http.StatusBadRequest,
			users.ExceptionResponse{Exception: "Trouble with request"})
		return
	}

	user, err := svcs.GetUserByEMail(data.EmailAddress)
	if err != nil {
		msg := "GetUserByEmail Problem: " + err.Error()

		svcs.CreateDBLogEntry("authenticate", "Debug", "StartPasswordReset", "", msg, c)
		c.JSON(http.StatusNotFound,
			users.ExceptionResponse{
				Exception: "No User for Email Address"})
		return
	}

	emp, err := svcs.GetEmployee(user.ID.Hex())
	if err != nil {
		msg := "GetEmployee Problem: " + err.Error()

		svcs.CreateDBLogEntry("authenticate", "Debug", "StartPasswordReset", "", msg, c)
		c.JSON(http.StatusNotFound,
			users.ExceptionResponse{
				Exception: err.Error()})
		return
	}

	// get verification token
	nToken := rand.Intn(999999)
	sToken := fmt.Sprintf("%06d", nToken)

	exp := time.Now().UTC().Add(time.Minute * time.Duration(30))

	user.ResetToken = sToken
	user.ResetTokenExp = &exp

	err = svcs.UpdateUser(*user)
	if err != nil {
		svcs.CreateDBLogEntry("authenticate", "Debug", "StartPasswordReset", "",
			fmt.Sprintf("StartPasswordReset: UpdateUser: %s", err.Error()), c)
		c.JSON(http.StatusNotFound,
			users.ExceptionResponse{
				Exception: "Problem Updating User: " + err.Error()})
		return
	}

	message := "<html><body><h3>You've been redirected to a reset password page.  Please use " +
		"the following verification token in the appropriate input field, " +
		" along with a new password/verified to allow you to access this " +
		"website again!</h3><br/><h2>" + sToken + "</h2></body></html>"

	to := []string{
		user.EmailAddress,
	}
	if len(emp.EmailAddresses) > 0 {
		for _, address := range emp.EmailAddresses {
			found := false
			if strings.EqualFold(user.EmailAddress, address) {
				found = true
			}
			if !found {
				to = append(to, address)
			}
		}
	}

	subject := "Reset Password Token"

	err = svcs.SendMail(to, subject, message)
	if err != nil {
		msg := "StartPasswordReset: SendMail: " + err.Error()
		svcs.CreateDBLogEntry("authenticate", "Debug", "StartPasswordReset", "", msg, c)
		c.JSON(http.StatusBadRequest, users.ExceptionResponse{Exception: msg})
		return
	}
	c.Status(http.StatusOK)
}

func PasswordReset(c *gin.Context) {
	var data users.PasswordResetRequest

	if err := c.ShouldBindJSON(&data); err != nil {
		svcs.CreateDBLogEntry("authenticate", "Debug", "PasswordReset", "",
			fmt.Sprintf("Data Binding Problem: %s", err.Error()), c)
		c.JSON(http.StatusBadRequest,
			users.AuthenticationResponse{
				Token: "", Exception: "Trouble with request"})
		return
	}

	user, err := svcs.GetUserByEMail(data.EmailAddress)
	if err != nil {
		msg := "PasswordReset: GetUserByEmail Problem: " + err.Error()
		svcs.CreateDBLogEntry("authenticate", "Debug", "PasswordReset", "", msg, c)
		c.JSON(http.StatusNotFound,
			users.ExceptionResponse{Exception: msg})
		return
	}

	if !strings.EqualFold(user.ResetToken, data.Token) {
		msg := "PasswordReset: Bad Reset Token"
		svcs.CreateDBLogEntry("authenticate", "Debug", "PasswordReset", "", msg, c)
		c.JSON(http.StatusBadRequest, users.ExceptionResponse{Exception: msg})
		return
	}

	if user.ResetTokenExp.Before(time.Now().UTC()) {
		msg := "PasswordReset: Reset Token Expired"
		svcs.CreateDBLogEntry("authenticate", "Debug", "PasswordReset", "", msg, c)
		c.JSON(http.StatusBadRequest, users.ExceptionResponse{Exception: msg})
		return
	}

	user.ResetToken = ""
	user.ResetTokenExp = nil
	user.BadAttempts = 0
	user.SetPassword(data.Password)

	err = svcs.UpdateUser(*user)
	if err != nil {
		svcs.CreateDBLogEntry("authenticate", "Debug", "PasswordReset", "",
			fmt.Sprintf("Update User Problem: %s", err.Error()), c)
		c.JSON(http.StatusBadRequest,
			users.AuthenticationResponse{
				Token: "", Exception: "PasswordReset: Problem Updating Database"})
		return
	}

	// create token
	tokenstring, err := svcs.CreateToken(user.ID, user.EmailAddress)
	if err != nil {
		msg := "PasswordReset: CreateToken Problem: " + err.Error()
		svcs.CreateDBLogEntry("authenticate", "Debug", "PasswordReset", "", msg, c)
		c.JSON(http.StatusNotFound,
			users.AuthenticationResponse{Token: "",
				Exception: msg})
		return
	}
	msg := fmt.Sprintf("User Login: %s logged into %s at %s", user.GetLastFirst(),
		data.Application, time.Now().Format("01/02/06 15:04"))
	svcs.CreateDBLogEntry("authenticate", "SUCCESS", "PasswordReset", "", msg, c)

	c.JSON(http.StatusOK, users.AuthenticationResponse{
		Token:     tokenstring,
		User:      *user,
		Exception: "",
	})
}
