package controllers

import (
	"fmt"
	"net/http"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/erneap/go-models/converters"
	"github.com/erneap/go-models/employees"
	"github.com/erneap/go-models/labor"
	"github.com/erneap/go-models/notifications"
	"github.com/erneap/go-models/svcs"
	"github.com/erneap/go-models/users"
	"github.com/erneap/scheduler3/scheduler-api/models/web"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func GetInitial(c *gin.Context) {
	id := c.Param("userid")
	logmsg := "EmployeeController: GetInitial: "

	emp, err := svcs.GetEmployee(id)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetEmployee Problem", "",
				fmt.Sprintf("%s GetEmployee, Employee Not Found: %s", logmsg, id), c)
			c.JSON(http.StatusNotFound, web.InitialResponse{
				Exception: "Employee Not Found"})
		} else {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetEmployee Problem", "",
				fmt.Sprintf("%s GetEmployee, %s: %s", logmsg, err.Error(), id), c)
			c.JSON(http.StatusBadRequest, web.InitialResponse{
				Exception: err.Error()})
		}
		return
	}

	teamid := emp.TeamID
	siteid := emp.SiteID

	team, err := svcs.GetTeam(teamid.Hex())
	if err != nil {
		if err == mongo.ErrNoDocuments {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetTeam Problem", "",
				fmt.Sprintf("%s GetTeam, Team Not Found: %s", logmsg, teamid.Hex()), c)
			c.JSON(http.StatusNotFound, web.InitialResponse{
				Exception: "Team Not Found"})
		} else {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetTeam Problem", "",
				fmt.Sprintf("%s GetTeam, %s: %s", logmsg, err.Error(), teamid.Hex()), c)
			c.JSON(http.StatusBadRequest, web.InitialResponse{
				Exception: err.Error()})
		}
		return
	}

	site, err := svcs.GetSite(teamid.Hex(), siteid)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetSite Problem", "",
				fmt.Sprintf("%s GetSite, Site Not Found: %s", logmsg, siteid), c)
			c.JSON(http.StatusNotFound, web.InitialResponse{
				Exception: "Site Not Found"})
		} else {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetSite Problem", "",
				fmt.Sprintf("%s GetSite, %s: %s", logmsg, err.Error(), siteid), c)
			c.JSON(http.StatusBadRequest, web.InitialResponse{
				Exception: err.Error()})
		}
		return
	}

	c.JSON(http.StatusOK, web.InitialResponse{
		Team:      team,
		Site:      site,
		Employee:  emp,
		Exception: "",
	})
}

func GetEmployee(c *gin.Context) {
	empID := c.Param("empid")
	logmsg := "EmployeeController: GetEmployee: "

	emp, err := svcs.GetEmployee(empID)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "Employee Not Found", "",
				fmt.Sprintf("%s Employee Not Found: %s", logmsg, empID), c)
			c.JSON(http.StatusNotFound, web.InitialResponse{
				Exception: "Employee Not Found"})
		} else {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetEmployee Problem", "",
				fmt.Sprintf("%s %s: %s", logmsg, err.Error(), empID), c)
			c.JSON(http.StatusBadRequest, web.InitialResponse{
				Exception: err.Error()})
		}
		return
	}
	c.JSON(http.StatusOK, web.EmployeeResponse{Employee: emp, Exception: ""})
}

func CreateEmployee(c *gin.Context) {
	var data web.NewEmployeeRequest
	logmsg := "EmployeeController: CreateEmployee:"

	if err := c.ShouldBindJSON(&data); err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "Binding Problem", "",
			fmt.Sprintf("%s %s: %s", logmsg, "RequestDataBinding", err.Error()), c)
		c.JSON(http.StatusBadRequest,
			web.EmployeeResponse{Employee: nil, Exception: "Trouble with request"})
		return
	}

	// The service checks for the employee and updates if present in the database,
	// but if not present, creates a new employee.
	emp, err := svcs.CreateEmployee(data.Employee, data.Password, "",
		data.TeamID, data.SiteID)
	if err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "Creation Problem", "",
			fmt.Sprintf("%s %s: %s", logmsg, "Creation Error", err.Error()), c)
		c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
			Exception: err.Error()})
	}
	svcs.CreateDBLogEntry("SchedulerAPI", "SUCCESS", "Employee Created", "",
		fmt.Sprintf("%s %s: %s", logmsg, "Employee Created",
			emp.Name.GetLastFirstMI()), c)
	c.JSON(http.StatusOK, web.EmployeeResponse{Employee: emp, Exception: ""})
}

// basic update includes name and company information which is unlike to change
// much.
func UpdateEmployeeBasic(c *gin.Context) {
	var data users.UpdateRequest
	logmsg := "EmployeeController: UpdateEmployeeBasic: "

	if err := c.ShouldBindJSON(&data); err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "Binding Problem", "",
			fmt.Sprintf("%s %s - %s", logmsg, "Request Data Binding", err.Error()), c)
		c.JSON(http.StatusBadRequest,
			web.EmployeeResponse{Employee: nil, Exception: "Trouble with request"})
		return
	}

	// Get the Employee through the data service
	emp, err := svcs.GetEmployee(data.ID)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "Employee Not Found", "",
				fmt.Sprintf("%s %s", logmsg, "GetEmployee, Employee Not Found"), c)
			c.JSON(http.StatusNotFound, web.EmployeeResponse{Employee: nil,
				Exception: "Employee Not Found"})
		} else {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetEmployee Problem", "",
				fmt.Sprintf("%s GetEmployee, %s", logmsg, err.Error()), c)
			c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
				Exception: err.Error()})
		}
		return
	}
	user, err := svcs.GetUserByID(data.ID)
	if err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetUser Problem", "",
			fmt.Sprintf("%s GetUserById, %s", logmsg, err.Error()), c)
		c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
			Exception: err.Error()})
		return
	}
	// update the corresponding field
	switch strings.ToLower(data.Field) {
	case "first", "firstname":
		emp.Name.FirstName = data.Value
		if user != nil {
			user.FirstName = data.Value
		}
	case "middle", "middlename":
		emp.Name.MiddleName = data.Value
		if user != nil {
			user.MiddleName = data.Value
		}
	case "last", "lastname":
		emp.Name.LastName = data.Value
		if user != nil {
			user.LastName = data.Value
		}
	case "email", "emailaddress":
		emp.Email = data.Value
		if user != nil {
			user.EmailAddress = data.Value
		}
	case "addemail":
		emp.AddEmailAddress(data.Value)
	case "removeemail":
		emp.RemoveEmailAddress(data.Value)
	case "updateemail":
		if data.OptionalID != "" {
			emp.RemoveEmailAddress(data.OptionalID)
			emp.AddEmailAddress(data.Value)
		}
	case "suffix":
		emp.Name.Suffix = data.Value
	case "company":
		emp.CompanyInfo.Company = data.Value
	case "employeeid", "companyid":
		emp.CompanyInfo.EmployeeID = data.Value
	case "alternateid", "alternate":
		emp.CompanyInfo.AlternateID = data.Value
	case "jobtitle", "title":
		emp.CompanyInfo.JobTitle = data.Value
	case "rank", "grade":
		emp.CompanyInfo.Rank = data.Value
	case "costcenter":
		emp.CompanyInfo.CostCenter = data.Value
	case "division":
		emp.CompanyInfo.Division = data.Value
	case "password":
		if user != nil {
			user.SetPassword(data.Value)
		}
	case "unlock":
		if user != nil {
			user.BadAttempts = 0
		}
	case "addworkgroup", "addperm", "addpermission":
		if user != nil {
			wg := "scheduler-" + data.Value
			found := false
			for _, wGroup := range user.Workgroups {
				if strings.EqualFold(wGroup, wg) {
					found = true
				}
			}
			if !found {
				user.Workgroups = append(user.Workgroups, wg)
			}
		}
	case "removeworkgroup", "remove", "removeperm", "removepermission":
		if user != nil {
			wg := "scheduler-" + data.Value
			pos := -1
			for i, wGroup := range user.Workgroups {
				if strings.EqualFold(wGroup, wg) {
					pos = i
				}
			}
			if pos >= 0 {
				user.Workgroups = append(user.Workgroups[:pos],
					user.Workgroups[pos+1:]...)
			}
		}
	}

	// send the employee back to the service for update.
	err = svcs.UpdateEmployee(emp)
	if err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "UpdateEmployee Problem", "",
			fmt.Sprintf("%s UpdateEmployee, %s", logmsg, err.Error()), c)
		c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
			Exception: err.Error()})
		return
	}

	// send user back to services for update
	if user != nil {
		err = svcs.UpdateUser(*user)
		if err != nil {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "Update User Problem", "",
				fmt.Sprintf("%s Update User, %s", logmsg, err.Error()), c)
		}
	}
	emp.User = user

	// return the corrected employee back to the client.
	c.JSON(http.StatusOK, web.EmployeeResponse{Employee: emp, Exception: ""})
}

func CreateEmployeeAssignment(c *gin.Context) {
	var newAsgmt web.NewEmployeeAssignment
	logmsg := "EmployeeController: CreateEmployeeAssignment:"

	if err := c.ShouldBindJSON(&newAsgmt); err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "Binding Problem", "",
			fmt.Sprintf("%s DataBinding: %s", logmsg, err.Error()), c)
		c.JSON(http.StatusBadRequest,
			web.EmployeeResponse{Employee: nil, Exception: "Trouble with request"})
		return
	}

	// get the employee from the id provided
	emp, err := svcs.GetEmployee(newAsgmt.EmployeeID)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "UpdateEmployee Problem", "",
				fmt.Sprintf("%s UpdateEmployee: %s", logmsg, "Employee Not Found"), c)
			c.JSON(http.StatusNotFound, web.EmployeeResponse{Employee: nil,
				Exception: "Employee Not Found"})
		} else {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetEmployee Problem", "",
				fmt.Sprintf("%s GetEmployee: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
				Exception: err.Error()})
		}
		return
	}
	emp.AddAssignment(newAsgmt.SiteID, newAsgmt.Workcenter, newAsgmt.StartDate)

	err = svcs.UpdateEmployee(emp)
	if err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "UpdateEmployee Problem", "",
			fmt.Sprintf("%s UpdateEmployee: %s", logmsg, err.Error()), c)
		c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
			Exception: err.Error()})
		return
	}

	// return the corrected employee back to the client.
	c.JSON(http.StatusOK, web.EmployeeResponse{Employee: emp, Exception: ""})
}

func UpdateEmployeeAssignment(c *gin.Context) {
	var data web.ChangeAssignmentRequest
	logmsg := "EmployeeController: UpdateEmployeeAssignment"

	if err := c.ShouldBindJSON(&data); err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR",
			"Binding Problem", "", fmt.Sprintf("%s %s", logmsg,
				"Request Data Binding, Trouble with request"), c)
		c.JSON(http.StatusBadRequest,
			web.EmployeeResponse{Employee: nil, Exception: "Trouble with request"})
		return
	}

	emp, err := svcs.GetEmployee(data.EmployeeID)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR",
				"GetEmployee Problem", "", fmt.Sprintf(
					"%s GetEmployee Problem: %s", logmsg, "Employee Not Found"), c)
			c.JSON(http.StatusNotFound, web.EmployeeResponse{Employee: nil,
				Exception: "Employee Not Found"})
		} else {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR",
				"GetEmployee Problem", "", fmt.Sprintf(
					"%s GetEmployee Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
				Exception: err.Error()})
		}
		return
	}

	for i, asgmt := range emp.Assignments {
		if asgmt.ID == data.AssignmentID {
			switch strings.ToLower(data.Field) {
			case "site":
				asgmt.Site = data.Value
			case "workcenter":
				asgmt.Workcenter = data.Value
			case "start", "startdate":
				asgmt.StartDate, err = time.ParseInLocation("2006-01-02", data.Value,
					time.UTC)
				if err != nil {
					svcs.CreateDBLogEntry("SchedulerAPI", "ERROR",
						"UpdateEmployeeAssignment Problem", "", fmt.Sprintf(
							"UpdateEmployee Problem: %s", err.Error()), c)
					c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
						Exception: err.Error()})
					return
				}
			case "end", "enddate":
				asgmt.EndDate, err = time.ParseInLocation("2006-01-02", data.Value,
					time.UTC)
				if err != nil {
					svcs.CreateDBLogEntry("SchedulerAPI", "ERROR",
						"UpdateEmployeeAssignment Problem", "", fmt.Sprintf(
							"UpdateEmployee Problem: %s", err.Error()), c)
					c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
						Exception: err.Error()})
					return
				}
			case "rotationdate":
				asgmt.RotationDate, err = time.ParseInLocation("2006-01-02", data.Value, time.UTC)
				if err != nil {
					svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "Rotation Date Problem", "",
						fmt.Sprintf("%s RotationDate: Time Parse Error: %s", logmsg,
							err.Error()), c)
				}
			case "rotationdays":
				asgmt.RotationDays = converters.ParseInt(data.Value)
			case "addschedule":
				asgmt.AddSchedule(converters.ParseInt(data.Value))
			case "changeschedule":
				asgmt.ChangeScheduleDays(data.ScheduleID, converters.ParseInt(data.Value))
			case "removeschedule":
				asgmt.RemoveSchedule(data.ScheduleID)
			}
			emp.Assignments[i] = asgmt
		}
	}

	err = svcs.UpdateEmployee(emp)
	if err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR",
			"UpdateEmployee Problem", "", fmt.Sprintf(
				"%s UpdateEmployee Problem: %s", logmsg, err.Error()), c)
		c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
			Exception: err.Error()})
		return
	}

	// return the corrected employee back to the client.
	c.JSON(http.StatusOK, web.EmployeeResponse{Employee: emp, Exception: ""})
}

func UpdateEmployeeAssignmentWorkday(c *gin.Context) {
	var data web.ChangeAssignmentRequest
	logmsg := "EmployeeController: UpdateEmployeeAssignmentWorkday"

	if err := c.ShouldBindJSON(&data); err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR",
			"Binding Problem", "", fmt.Sprintf(
				"%s DataBinding Problem: %s", logmsg, err.Error()), c)
		c.JSON(http.StatusBadRequest,
			web.EmployeeResponse{Employee: nil, Exception: "Trouble with request"})
		return
	}

	emp, err := svcs.GetEmployee(data.EmployeeID)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR",
				"GetEmployee Problem", "", fmt.Sprintf(
					"%s GetEmployee Problem: %s", logmsg,
					"Employee Not Found"), c)
			c.JSON(http.StatusNotFound, web.EmployeeResponse{Employee: nil,
				Exception: "Employee Not Found"})
		} else {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR",
				"GetEmployee Problem", "", fmt.Sprintf(
					"%s GetEmployee Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
				Exception: err.Error()})
		}
		return
	}

	for i, asgmt := range emp.Assignments {
		if asgmt.ID == data.AssignmentID {
			for j, sch := range asgmt.Schedules {
				if sch.ID == data.ScheduleID {
					for k, wd := range sch.Workdays {
						if wd.ID == data.WorkdayID {
							switch strings.ToLower(data.Field) {
							case "workcenter":
								wd.Workcenter = data.Value
							case "code":
								wd.Code = data.Value
							case "hours":
								wd.Hours = converters.ParseFloat(data.Value)
							case "copy":
								var wdOld *employees.Workday
								for w := k - 1; w >= 0 && wdOld == nil; w-- {
									oWd := sch.Workdays[w]
									if oWd.Code != "" && oWd.Workcenter != "" && oWd.Hours > 0.0 {
										wdOld = &oWd
									}
								}
								if wdOld != nil {
									wd.Code = wdOld.Code
									wd.Workcenter = wdOld.Workcenter
									wd.Hours = wdOld.Hours
								}
							}
							sch.Workdays[k] = wd
							asgmt.Schedules[j] = sch
							emp.Assignments[i] = asgmt
						}
					}
				}
			}
		}
	}

	err = svcs.UpdateEmployee(emp)
	if err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR",
			"UpdateEmployee Problem", "", fmt.Sprintf(
				"%s UpdateEmployee Problem: %s", logmsg, err.Error()), c)
		c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
			Exception: err.Error()})
		return
	}

	// return the corrected employee back to the client.
	c.JSON(http.StatusOK, web.EmployeeResponse{Employee: emp, Exception: ""})
}

func DeleteEmployeeAssignment(c *gin.Context) {
	logmsg := "EmployeeController: DeleteEmployeeAssignment:"
	empID := c.Param("empid")
	asgmtID, err := strconv.ParseUint(c.Param("asgmtid"), 10, 32)
	if err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR",
			"Assignment Problem", "", fmt.Sprintf("%s Assignment ID Conversion Problem: %s",
				logmsg, err.Error()), c)
		c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
			Exception: err.Error()})
		return
	}

	emp, err := svcs.GetEmployee(empID)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR",
				"GetEmployee Problem", "", fmt.Sprintf("%s GetEmployee Problem: %s", logmsg,
					"Employee Not Found"), c)
			c.JSON(http.StatusNotFound, web.EmployeeResponse{Employee: nil,
				Exception: "Employee Not Found"})
		} else {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR",
				"GetEmployee Problem", "", fmt.Sprintf("%s GetEmployee Problem: %s", logmsg,
					err.Error()), c)
			c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
				Exception: err.Error()})
		}
		return
	}
	emp.RemoveAssignment(uint(asgmtID))

	err = svcs.UpdateEmployee(emp)
	if err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR",
			"UpdateEmployee Problem", "", fmt.Sprintf("%s UpdateEmployee Problem: %s", logmsg,
				err.Error()), c)
		c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
			Exception: err.Error()})
		return
	}

	// return the corrected employee back to the client.
	c.JSON(http.StatusOK, web.EmployeeResponse{Employee: emp, Exception: ""})
}

func DeleteEmployee(c *gin.Context) {
	empID := c.Param("empid")
	logmsg := "EmployeeController: DeleteEmployee:"

	emp, err := svcs.GetEmployee(empID)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR",
				"GetEmployee Problem", "", fmt.Sprintf("%s GetEmployee Problem: %s", logmsg,
					"Employee Not Found"), c)
			c.JSON(http.StatusNotFound, web.EmployeeResponse{Employee: nil,
				Exception: "Employee Not Found"})
		} else {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR",
				"GetEmployee Problem", "", fmt.Sprintf("%s GetEmployee Problem: %s", logmsg,
					err.Error()), c)
			c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
				Exception: err.Error()})
		}
		return
	}

	err = svcs.DeleteEmployee(empID)
	if err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "DeleteEmployee Problem", "",
			fmt.Sprintf("%s Problem: %s", logmsg, err.Error()), c)
		c.JSON(http.StatusBadRequest, notifications.Message{Message: err.Error()})
		return
	}
	svcs.CreateDBLogEntry("SchedulerAPI", "SUCCESS",
		"DELETION", "", fmt.Sprintf("%s Employee Deleted: %s", logmsg,
			emp.Name.GetLastFirstMI()), c)
	c.JSON(http.StatusOK, notifications.Message{Message: "employee deleted"})
}

func CreateEmployeeVariation(c *gin.Context) {
	var data web.NewEmployeeVariation
	logmsg := "EmployeeController: CreateEmployeeVariation:"

	if err := c.ShouldBindJSON(&data); err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "Binding Problem", "",
			fmt.Sprintf("%s Request Data Binding, Trouble with request", logmsg), c)
		c.JSON(http.StatusBadRequest,
			web.EmployeeResponse{Employee: nil, Exception: "Trouble with request"})
		return
	}

	emp, err := svcs.GetEmployee(data.EmployeeID)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetEmployee Problem", "",
				fmt.Sprintf("%s GetEmployee Problem: %s", logmsg,
					"Employee Not Found"), c)
			c.JSON(http.StatusNotFound, web.EmployeeResponse{Employee: nil,
				Exception: "Employee Not Found"})
		} else {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetEmployee Problem", "",
				fmt.Sprintf("%s GetEmployee Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
				Exception: err.Error()})
		}
		return
	}

	site, err := svcs.GetSite(emp.TeamID.Hex(), emp.SiteID)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetEmployee Problem", "",
				fmt.Sprintf("%s GetEmployee Problem: %s", logmsg,
					"Employee Not Found"), c)
			c.JSON(http.StatusNotFound, web.EmployeeResponse{Employee: nil,
				Exception: "Employee Not Found"})
		} else {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetEmployee Problem", "",
				fmt.Sprintf("%s GetEmployee Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
				Exception: err.Error()})
		}
		return
	}

	max := uint(0)
	for _, vari := range emp.Variations {
		if vari.ID > max {
			max = vari.ID
		}
	}
	data.Variation.ID = max + 1

	offset := time.Hour * time.Duration(site.UtcOffset)
	start := data.Variation.StartDate.Add(offset)
	data.Variation.StartDate = time.Date(start.Year(), start.Month(), start.Day(),
		0, 0, 0, 0, time.UTC)
	end := data.Variation.EndDate.Add(offset)
	data.Variation.EndDate = time.Date(end.Year(), end.Month(), end.Day(), 0, 0,
		0, 0, time.UTC)

	emp.Variations = append(emp.Variations, data.Variation)
	sort.Sort(employees.ByVariation(emp.Variations))

	err = svcs.UpdateEmployee(emp)
	if err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "UpdateEmployee Problem", "",
			fmt.Sprintf("%s UpdateEmployee Problem: %s", logmsg, err.Error()), c)
		c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
			Exception: err.Error()})
		return
	}

	// return the corrected employee back to the client.
	c.JSON(http.StatusOK, web.EmployeeResponse{Employee: emp, Exception: ""})
}

func UpdateEmployeeVariation(c *gin.Context) {
	var data web.ChangeAssignmentRequest
	logmsg := "EmployeeController: UpdateEmployeeVariation:"

	if err := c.ShouldBindJSON(&data); err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "Binding Problem", "",
			fmt.Sprintf("%s Request Data Binding, Trouble with request", logmsg), c)
		c.JSON(http.StatusBadRequest,
			web.EmployeeResponse{Employee: nil, Exception: "Trouble with request"})
		return
	}

	emp, err := svcs.GetEmployee(data.EmployeeID)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetEmployee Problem", "",
				fmt.Sprintf("%s UpdateEmployee Problem: %s", logmsg,
					"Employee Not Found"), c)
			c.JSON(http.StatusNotFound, web.EmployeeResponse{Employee: nil,
				Exception: "Employee Not Found"})
		} else {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetEmployee Problem", "",
				fmt.Sprintf("%s GetEmployee Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
				Exception: err.Error()})
		}
		return
	}

	for i, vari := range emp.Variations {
		if vari.ID == data.AssignmentID {
			switch strings.ToLower(data.Field) {
			case "site":
				vari.Site = data.Value
			case "mids", "ismids":
				vari.IsMids = converters.ParseBoolean(data.Value)
			case "dates":
				vari.Schedule.ShowDates = converters.ParseBoolean(data.Value)
			case "start", "startdate":
				vari.StartDate, err = time.ParseInLocation("2006-01-02", data.Value,
					time.UTC)
				if err != nil {
					svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "UpdateEmployeeVariation Problem",
						"", fmt.Sprintf("UpdateEmployee Problem: %s", err.Error()), c)
					c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
						Exception: err.Error()})
					return
				}
			case "end", "enddate":
				vari.EndDate, err = time.ParseInLocation("2006-01-02", data.Value,
					time.UTC)
				if err != nil {
					svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "UpdateEmployeeVariation Problem",
						"", fmt.Sprintf("UpdateEmployee Problem: %s", err.Error()), c)
					c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
						Exception: err.Error()})
					return
				}
			case "changeschedule":
				vari.Schedule.SetScheduleDays(converters.ParseInt(data.Value))
			case "resetschedule":
				workcenter := ""
				code := ""
				hours := 0.0
				var workdays []time.Weekday
				start := time.Date(vari.StartDate.Year(), vari.StartDate.Month(),
					vari.StartDate.Day(), 0, 0, 0, 0, time.UTC)
				for start.Weekday() != time.Sunday {
					start = start.AddDate(0, 0, -1)
				}
				for i, wd := range vari.Schedule.Workdays {
					wDate := start.AddDate(0, 0, i)
					if hours <= 0.0 && wd.Hours > 0.0 {
						workcenter = wd.Workcenter
						code = wd.Code
						hours = wd.Hours
						found := false
						for _, wday := range workdays {
							if wday == wDate.Weekday() {
								found = true
							}
						}
						if !found {
							workdays = append(workdays, wDate.Weekday())
						}
					}
				}
				vari.SetScheduleDays()
				sort.Sort(employees.ByWorkday(vari.Schedule.Workdays))

				count := uint(0)
				for start.Before(vari.EndDate) || start.Equal(vari.EndDate) {
					count++
					wd := vari.Schedule.Workdays[count]
					if start.Equal(vari.StartDate) || start.After(vari.StartDate) {
						found := false
						for _, wDay := range workdays {
							if start.Weekday() == wDay {
								found = true
							}
						}
						if found {
							wd.Workcenter = workcenter
							wd.Code = code
							wd.Hours = hours
						} else {
							wd.Workcenter = ""
							wd.Code = ""
							wd.Hours = float64(0.0)
						}
					}
					vari.Schedule.Workdays[count] = wd
					start = start.AddDate(0, 0, 1)
				}
			}
		}
		emp.Variations[i] = vari
	}

	sort.Sort(employees.ByVariation(emp.Variations))

	err = svcs.UpdateEmployee(emp)
	if err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "UpdateEmployee Problem", "",
			fmt.Sprintf("%s UpdateEmployee Problem: %s", logmsg, err.Error()), c)
		c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
			Exception: err.Error()})
		return
	}

	// return the corrected employee back to the client.
	c.JSON(http.StatusOK, web.EmployeeResponse{Employee: emp, Exception: ""})
}

func UpdateEmployeeVariationWorkday(c *gin.Context) {
	var data web.ChangeAssignmentRequest
	logmsg := "EmployeeController: UpdateEmployeeVariationWorkday:"

	if err := c.ShouldBindJSON(&data); err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "Binding Problem", "",
			fmt.Sprintf("%s Request Data Binding, Trouble with request", logmsg), c)
		c.JSON(http.StatusBadRequest,
			web.EmployeeResponse{Employee: nil, Exception: "Trouble with request"})
		return
	}

	emp, err := svcs.GetEmployee(data.EmployeeID)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetEmployee Problem", "",
				fmt.Sprintf("%s GetEmployee Problem: %s", logmsg, "Employee Not Found"), c)
			c.JSON(http.StatusNotFound, web.EmployeeResponse{Employee: nil,
				Exception: "Employee Not Found"})
		} else {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetEmployee Problem", "",
				fmt.Sprintf("%s GetEmployee Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
				Exception: err.Error()})
		}
		return
	}

	for i, vari := range emp.Variations {
		if vari.ID == data.AssignmentID {
			for k, wd := range vari.Schedule.Workdays {
				if wd.ID == data.WorkdayID {
					switch strings.ToLower(data.Field) {
					case "workcenter":
						wd.Workcenter = data.Value
					case "code":
						wd.Code = data.Value
					case "hours":
						wd.Hours = converters.ParseFloat(data.Value)
					case "copy":
						var wdOld *employees.Workday
						for w := k - 1; w >= 0 && wdOld == nil; w-- {
							oWd := vari.Schedule.Workdays[w]
							if oWd.Code != "" && oWd.Workcenter != "" && oWd.Hours > 0.0 {
								wdOld = &oWd
							}
						}
						if wdOld != nil {
							wd.Code = wdOld.Code
							wd.Workcenter = wdOld.Workcenter
							wd.Hours = wdOld.Hours
						}
					}
					vari.Schedule.Workdays[k] = wd
					emp.Variations[i] = vari
				}
			}
		}
	}

	err = svcs.UpdateEmployee(emp)
	if err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "UpdateEmployee Problem", "",
			fmt.Sprintf("%s UpdateEmployee Problem: %s", logmsg,
				err.Error()), c)
		c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
			Exception: err.Error()})
		return
	}

	// return the corrected employee back to the client.
	c.JSON(http.StatusOK, web.EmployeeResponse{Employee: emp, Exception: ""})
}

func DeleteEmployeeVariation(c *gin.Context) {
	empID := c.Param("empid")
	logmsg := "EmployeeController: DeleteEmployeeVariation:"
	variID, err := strconv.ParseUint(c.Param("variid"), 10, 32)
	if err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "Conversion Problem", "",
			fmt.Sprintf("%s Convert Variation ID Problem: %s", logmsg, err.Error()), c)
		c.JSON(http.StatusBadRequest,
			web.EmployeeResponse{Employee: nil, Exception: "Trouble with request"})
		return
	}

	emp, err := svcs.GetEmployee(empID)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetEmployee Problem", "",
				fmt.Sprintf("%s GetEmployee Problem: %s", logmsg,
					"Employee Not Found"), c)
			c.JSON(http.StatusNotFound, web.EmployeeResponse{Employee: nil,
				Exception: "Employee Not Found"})
		} else {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetEmployee Problem", "",
				fmt.Sprintf("%s GetEmployee Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
				Exception: err.Error()})
		}
		return
	}

	pos := -1
	for i, vari := range emp.Variations {
		if vari.ID == uint(variID) {
			pos = i
		}
	}
	if pos >= 0 {
		emp.Variations = append(emp.Variations[:pos],
			emp.Variations[pos+1:]...)
	}

	err = svcs.UpdateEmployee(emp)
	if err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "UpdateEmployee Problem", "",
			fmt.Sprintf("%s UpdateEmployee Problem: %s", logmsg, err.Error()), c)
		c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
			Exception: err.Error()})
		return
	}

	// return the corrected employee back to the client.
	c.JSON(http.StatusOK, web.EmployeeResponse{Employee: emp, Exception: ""})
}

func CreateEmployeeLeaveBalance(c *gin.Context) {
	var data web.LeaveBalanceRequest
	logmsg := "EmployeeController: CreateEmployeeLeaveBalance:"
	if err := c.ShouldBindJSON(&data); err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "Binding Problem", "",
			fmt.Sprintf("%s Request Data Binding, Trouble with request", logmsg), c)
		c.JSON(http.StatusBadRequest,
			web.EmployeeResponse{Employee: nil, Exception: "Trouble with request"})
		return
	}

	emp, err := svcs.GetEmployee(data.EmployeeID)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetEmployee Problem", "",
				fmt.Sprintf("%s GetEmployee Problem: %s", logmsg,
					"Employee Not Found"), c)
			c.JSON(http.StatusNotFound, web.EmployeeResponse{Employee: nil,
				Exception: "Employee Not Found"})
		} else {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetEmployee Problem", "",
				fmt.Sprintf("%s GetEmployee Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
				Exception: err.Error()})
		}
		return
	}

	emp.CreateLeaveBalance(data.Year)

	err = svcs.UpdateEmployee(emp)
	if err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "UpdateEmployee Problem", "",
			fmt.Sprintf("UpdateEmployee Problem: %s", err.Error()), c)
		c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
			Exception: err.Error()})
		return
	}

	// return the corrected employee back to the client.
	c.JSON(http.StatusOK, web.EmployeeResponse{Employee: emp, Exception: ""})
}

func UpdateEmployeeLeaveBalance(c *gin.Context) {
	var data users.UpdateRequest
	logmsg := "EmployeeController: UpdateEmployeeLeaveBalance:"
	if err := c.ShouldBindJSON(&data); err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "Binding Problem", "",
			fmt.Sprintf("%s Request Data Binding, Trouble with request", logmsg), c)
		c.JSON(http.StatusBadRequest,
			web.EmployeeResponse{Employee: nil, Exception: "Trouble with request"})
		return
	}

	emp, err := svcs.GetEmployee(data.ID)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetEmployee Problem", "",
				fmt.Sprintf("%s GetEmployee Problem: %s", logmsg, "Employee Not Found"), c)
			c.JSON(http.StatusNotFound, web.EmployeeResponse{Employee: nil,
				Exception: "Employee Not Found"})
		} else {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetEmployee Problem", "",
				fmt.Sprintf("%s GetEmployee Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
				Exception: err.Error()})
		}
		return
	}

	year, err := strconv.Atoi(data.OptionalID)
	if err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "Conversion Problem", "",
			fmt.Sprintf("%s Convert Year Problem: %s", logmsg, err.Error()), c)
		c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
			Exception: err.Error()})
		return
	}

	fvalue, err := strconv.ParseFloat(data.Value, 64)
	if err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "Conversion Problem", "",
			fmt.Sprintf("%s Convert Value Problem: %s", logmsg, err.Error()), c)
		c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
			Exception: err.Error()})
		return
	}

	for i, lb := range emp.Balances {
		if lb.Year == year {
			if strings.ToLower(data.Field) == "annual" {
				lb.Annual = fvalue
			} else {
				lb.Carryover = fvalue
			}
			emp.Balances[i] = lb
		}
	}

	err = svcs.UpdateEmployee(emp)
	if err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "UpdateEmployee Problem", "",
			fmt.Sprintf("%s UpdateEmployee Problem: %s", logmsg, err.Error()), c)
		c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
			Exception: err.Error()})
		return
	}

	// return the corrected employee back to the client.
	c.JSON(http.StatusOK, web.EmployeeResponse{Employee: emp, Exception: ""})
}

func DeleteEmployeeLeaveBalance(c *gin.Context) {
	logmsg := "EmployeeController: DeleteEmployeeLeaveBalance:"
	empID := c.Param("empid")
	year, err := strconv.ParseInt(c.Param("year"), 10, 32)
	if err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "Conversion Problem", "",
			fmt.Sprintf("%s Convert Year Problem: %s", logmsg, err.Error()), c)
		c.JSON(http.StatusBadRequest,
			web.EmployeeResponse{Employee: nil, Exception: "Trouble with request"})
		return
	}

	emp, err := svcs.GetEmployee(empID)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetEmployee Problem", "",
				fmt.Sprintf("%s GetEmployee Problem: %s", logmsg,
					"Employee Not Found"), c)
			c.JSON(http.StatusNotFound, web.EmployeeResponse{Employee: nil,
				Exception: "Employee Not Found"})
		} else {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetEmployee Problem", "",
				fmt.Sprintf("%s GetEmployee Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
				Exception: err.Error()})
		}
		return
	}

	pos := -1
	for i, bal := range emp.Balances {
		if bal.Year == int(year) {
			pos = i
		}
	}
	if pos >= 0 {
		emp.Balances = append(emp.Balances[:pos],
			emp.Balances[pos+1:]...)
	}

	err = svcs.UpdateEmployee(emp)
	if err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "UpdateEmployee Problem", "",
			fmt.Sprintf("%s UpdateEmployee Problem: %s", logmsg, err.Error()), c)
		c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
			Exception: err.Error()})
		return
	}

	// return the corrected employee back to the client.
	c.JSON(http.StatusOK, web.EmployeeResponse{Employee: emp, Exception: ""})
}

func CreateEmployeeLeaveRequest(c *gin.Context) {
	var data web.EmployeeLeaveRequest
	logmsg := "EmployeeController: CreateEmployeeLeaveRequest:"

	if err := c.ShouldBindJSON(&data); err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "Binding Problem", "",
			fmt.Sprintf("%s Request Data Binding, Trouble with request", logmsg), c)
		c.JSON(http.StatusBadRequest,
			web.EmployeeResponse{Employee: nil, Exception: "Trouble with request"})
		return
	}

	emp, err := svcs.GetEmployee(data.EmployeeID)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetEmployee Problem", "",
				fmt.Sprintf("%s GetEmployee Problem: %s", logmsg, "Employee Not Found"), c)
			c.JSON(http.StatusNotFound, web.EmployeeResponse{Employee: nil,
				Exception: "Employee Not Found"})
		} else {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetEmployee Problem", "",
				fmt.Sprintf("%s GetEmployee Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
				Exception: err.Error()})
		}
		return
	}

	site, err := svcs.GetSite(emp.TeamID.Hex(), emp.SiteID)
	if err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetSite Problem", "",
			fmt.Sprintf("%s GetSite Problem: %s", logmsg, err.Error()), c)
	}
	req := emp.NewLeaveRequest(data.EmployeeID, data.Code, data.StartDate,
		data.EndDate, site.UtcOffset, data.Comment)

	err = svcs.UpdateEmployee(emp)
	if err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "UpdateEmployee Problem", "",
			fmt.Sprintf("%s UpdateEmployee Problem: %s", logmsg, err.Error()), c)
		c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
			Exception: err.Error()})
		return
	}

	// return the corrected employee back to the client.
	svcs.CreateDBLogEntry("leaverequest", "CREATED", "Creation", "",
		fmt.Sprintf("Leave Request Created for %s: Base Code: %s Period: %s-%s",
			emp.Name.GetLastFirstMI(), data.Code,
			data.StartDate.Format("01/02/06"), data.EndDate.Format("01/02/06")), c)
	c.JSON(http.StatusOK, web.EmployeeResponse{Employee: emp,
		LeaveRequest: req, Exception: ""})
}

func UpdateEmployeeLeaveRequest(c *gin.Context) {
	var data users.UpdateRequest
	logmsg := "EmployeeController: UpdateEmployeeLeaveRequest:"
	if err := c.ShouldBindJSON(&data); err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "Binding Problem", "",
			fmt.Sprintf("%s Request Data Binding, Trouble with request", logmsg), c)
		c.JSON(http.StatusBadRequest,
			web.EmployeeResponse{Employee: nil, Exception: "Trouble with request"})
		return
	}

	emp, err := svcs.GetEmployee(data.ID)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetEmployee Problem", "",
				fmt.Sprintf("%s GetEmployee Problem: %s", logmsg, "Employee Not Found"), c)
			c.JSON(http.StatusNotFound, web.EmployeeResponse{Employee: nil,
				Exception: "Employee Not Found"})
		} else {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetEmployee Problem", "",
				fmt.Sprintf("%s GetEmployee Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
				Exception: err.Error()})
		}
		return
	}
	site, err := svcs.GetSite(emp.TeamID.Hex(), emp.SiteID)
	if err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetSite Problem", "",
			fmt.Sprintf("%s Retrieving Site Problem: %s", logmsg, err.Error()), c)
	}
	offset := 0.0
	if site != nil {
		offset = site.UtcOffset
	}

	var msg string
	var req *employees.LeaveRequest
	if strings.ToLower(data.Field) != "approve" {
		msg, req, err = emp.UpdateLeaveRequest(data.OptionalID, data.Field,
			data.Value, offset)
		if err != nil {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "UpdateLeaveRequest Problem",
				"", fmt.Sprintf("%s Updating LeaveRequest Problem: %s",
					logmsg, err.Error()), c)
			c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
				Exception: err.Error()})
			return
		}
	} else {
		leavecodes := make([]labor.Workcode, 0)
		team, err := svcs.GetTeam(emp.TeamID.Hex())
		if err != nil {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetTeam Problem", "",
				fmt.Sprintf("%s Retrieving Team Problem: %s", logmsg, err.Error()), c)
		}
		for _, wc := range team.Workcodes {
			if wc.IsLeave {
				leavecodes = append(leavecodes, wc)
			}
		}
		msg, req, err = emp.ApproveLeaveRequest(data.OptionalID, data.Field,
			data.Value, offset, leavecodes)
		if err != nil {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "LeaveRequest Approval Problem",
				"", fmt.Sprintf("%s Approving LeaveRequest Problem: %s",
					logmsg, err.Error()), c)
			c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
				Exception: err.Error()})
			return
		}
	}

	if msg != "" {
		if strings.Contains(strings.ToLower(msg), "approved") ||
			strings.Contains(strings.ToLower(msg), "unapproved") {
			err = svcs.CreateMessage(emp.ID.Hex(), data.Value, msg)
			if err != nil {
				svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "UpdateLeaveRequest Problem",
					"", fmt.Sprintf("%s Updating LeaveRequest Problem: %s",
						logmsg, err.Error()), c)
			}
			to := []string{emp.User.EmailAddress}
			if len(emp.EmailAddresses) > 0 {
				for _, email := range emp.EmailAddresses {
					if !strings.EqualFold(emp.User.EmailAddress, email) {
						to = append(to, email)
					}
				}
			}
			subj := "Leave Request Approved"
			err = svcs.SendMail(to, subj, msg)
			if err != nil {
				svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "SendMail Problem",
					"", fmt.Sprintf("%s Updating LeaveRequest Problem: %s",
						logmsg, err.Error()), c)
			} else {
				svcs.CreateDBLogEntry("leaverequest", "Info", "SendEmail", "",
					fmt.Sprintf("%s Updating LeaveRequest: %s",
						logmsg, "Email msg sent"), c)
			}
			if req.ApprovedBy != "" {
				logentry := fmt.Sprintf("Leave Request for %s was approved.<br>",
					emp.Name.GetLastFirstMI()) +
					fmt.Sprintf("Dates: Start: %s, End: %s<br>",
						req.StartDate.Format("01/02/06"), req.EndDate.Format("01/02/06"))
				approver, err := svcs.GetEmployee(req.ApprovedBy)
				if err == nil {
					logentry += fmt.Sprintf("Approved By: %s",
						approver.Name.GetLastFirstMI())
				}
				svcs.CreateDBLogEntry("leaverequest", "SUCCESS", "Approved", "", logentry, c)
			}
		} else {
			siteEmps, _ := svcs.GetEmployees(emp.TeamID.Hex(), emp.SiteID)
			var to []string
			for _, e := range siteEmps {
				if e.User.IsInGroup("scheduler", "siteleader") ||
					e.User.IsInGroup("scheduler", "scheduler") {
					if len(e.EmailAddresses) > 0 {
						to = append(to, e.EmailAddresses...)
					} else {
						to = append(to, e.User.EmailAddress)
					}
					err = svcs.CreateMessage(e.ID.Hex(), emp.ID.Hex(), msg)
					if err != nil {
						fmt.Println(err.Error())
					}
				}
			}
			if strings.Contains(strings.ToLower(msg), "submitted") {
				svcs.CreateDBLogEntry("leaverequest", "SUCCESS", "Submitted", "",
					fmt.Sprintf("Leave Request submitted for period: %s - %s",
						req.StartDate.Format("01/02/06"), req.EndDate.Format("01/02/06")), c)
			} else {
				svcs.CreateDBLogEntry("leaverequest", "SUCCESS", "Changed", "",
					fmt.Sprintf("Leave Request changed: %s", msg), c)
			}
			if len(to) > 0 {
				err = svcs.SendMail(to, "Leave Request Submitted", msg)
				if err != nil {
					fmt.Println(err.Error())
				} else {
					fmt.Println("Email message sent")
				}
			}
		}
	}

	err = svcs.UpdateEmployee(emp)
	if err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "UpdateEmployee Problem", "",
			fmt.Sprintf("%s UpdateEmployee Problem: %s", logmsg, err.Error()), c)
		c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
			Exception: err.Error()})
		return
	}

	// return the corrected employee back to the client.
	c.JSON(http.StatusOK, web.EmployeeResponse{Employee: emp, Exception: ""})
}

func DeleteEmployeeLeaveRequest(c *gin.Context) {
	empID := c.Param("empid")
	reqID := c.Param("reqid")
	logmsg := "EmployeeController: DeleteEmployeeLeaveRequest:"

	emp, err := svcs.GetEmployee(empID)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetEmployee Problem", "",
				fmt.Sprintf("%s GetEmployee Problem: %s", logmsg, "Employee Not Found"), c)
			c.JSON(http.StatusNotFound, web.EmployeeResponse{Employee: nil,
				Exception: "Employee Not Found"})
		} else {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetEmployee Problem", "",
				fmt.Sprintf("%s GetEmployee Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
				Exception: err.Error()})
		}
		return
	}

	msg, err := emp.DeleteLeaveRequest(reqID)
	if err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "Deletion Problem", "",
			fmt.Sprintf("%s DeleteLeaveRequest Problem: %s", logmsg, err.Error()), c)
		c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
			Exception: err.Error()})
		return
	}
	if msg != "" {

		to := []string{emp.User.EmailAddress}
		if len(emp.EmailAddresses) > 0 {
			for _, email := range emp.EmailAddresses {
				if !strings.EqualFold(emp.User.EmailAddress, email) {
					to = append(to, email)
				}
			}
		}
		subj := "Leave Request Approved"
		err = svcs.SendMail(to, subj, msg)
		if err != nil {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "UpdateLeaveRequest Problem",
				"", fmt.Sprintf("%s Updating LeaveRequest Problem: %s",
					logmsg, err.Error()), c)
		}
	}

	err = svcs.UpdateEmployee(emp)
	if err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "UpdateEmployee Problem", "",
			fmt.Sprintf("%s UpdateEmployee Problem: %s", logmsg, err.Error()), c)
		c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
			Exception: err.Error()})
		return
	}

	// return the corrected employee back to the client.
	svcs.CreateDBLogEntry("leaverequest", "SUCCESS", "DELETED", "", msg, c)
	c.JSON(http.StatusOK, web.EmployeeResponse{Employee: emp, Exception: ""})
}

func AddEmployeeLeaveDay(c *gin.Context) {
	var data web.EmployeeLeaveDayRequest
	logmsg := "EmployeeController: AddEmployeeLeaveDay:"
	if err := c.ShouldBindJSON(&data); err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "Binding Problem", "",
			fmt.Sprintf("%s Request Data Binding, Trouble with request", logmsg), c)
		c.JSON(http.StatusBadRequest,
			web.EmployeeResponse{Employee: nil, Exception: "Trouble with request"})
		return
	}

	emp, err := svcs.GetEmployee(data.EmployeeID)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetEmployee Problem", "",
				fmt.Sprintf("%s Updating Employee problem: Employee Not Found", logmsg), c)
			c.JSON(http.StatusNotFound, web.EmployeeResponse{Employee: nil,
				Exception: "Employee Not Found"})
		} else {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetEmployee Problem", "",
				fmt.Sprintf("%s GetEmployee problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
				Exception: err.Error()})
		}
		return
	}

	emp.AddLeave(data.Leave.ID, data.Leave.LeaveDate, data.Leave.Code,
		data.Leave.Status, data.Leave.Hours, &primitive.NilObjectID)

	err = svcs.UpdateEmployee(emp)
	if err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "UpdateEmployee Problem", "",
			fmt.Sprintf("%s Updating Employee problem: %s", logmsg, err.Error()), c)
		c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
			Exception: err.Error()})
		return
	}

	// return the corrected employee back to the client.
	svcs.CreateDBLogEntry("leaves", "Create", "ADD", "",
		fmt.Sprintf("Leave Created for %s: Date: %s, Code: %s, Hours: %2.1f",
			emp.Name.GetLastFirstMI(), data.Leave.LeaveDate.Format("01-02-06"),
			data.Leave.Code, data.Leave.Hours), c)
	c.JSON(http.StatusOK, web.EmployeeResponse{Employee: emp, Exception: ""})
}

func DeleteEmployeeLeaveDay(c *gin.Context) {
	empID := c.Param("empid")
	sLvID := c.Param("lvid")
	logmsg := "EmployeeController: DeleteEmployeeLeaveDay:"

	emp, err := svcs.GetEmployee(empID)
	if err != nil {
		fmt.Println(err.Error())
		if err == mongo.ErrNoDocuments {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetEmployee Problem", "",
				fmt.Sprintf("%s getEmployee Problem: Employee Not Found", logmsg), c)
			c.JSON(http.StatusNotFound, web.EmployeeResponse{Employee: nil,
				Exception: "Employee Not Found"})
		} else {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetEmployee Problem", "",
				fmt.Sprintf("%s getEmployee Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
				Exception: err.Error()})
		}
		return
	}

	lvID, err := strconv.Atoi(sLvID)
	if err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "Conversion Problem", "",
			fmt.Sprintf("%s LeaveDayID Conversion Error: %s", logmsg, err.Error()), c)
		c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
			Exception: err.Error()})
		return
	}

	old := emp.DeleteLeave(lvID)

	err = svcs.UpdateEmployee(emp)
	if err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "UpdateEmployee Problem", "",
			fmt.Sprintf("%s UpdateEmployee Problem: %s", logmsg, err.Error()), c)
		c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
			Exception: err.Error()})
		return
	}

	// return the corrected employee back to the client.
	svcs.CreateDBLogEntry("leaves", "DELETE", "DELETION", "",
		fmt.Sprintf("Manual Leave Deletion for %s from %s",
			emp.Name.GetLastFirstMI(), old.LeaveDate.Format("01-02-06")), c)
	c.JSON(http.StatusOK, web.EmployeeResponse{Employee: emp, Exception: ""})
}

func UpdateEmployeeLeaveDay(c *gin.Context) {
	var data users.UpdateRequest
	logmsg := "EmployeeController: UpdateEmployeeLeaveDay:"
	if err := c.ShouldBindJSON(&data); err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "UpdateEmployeeLeaveDay", "",
			fmt.Sprintf("%s Request Data Binding, Trouble with request", logmsg), c)
		c.JSON(http.StatusBadRequest,
			web.EmployeeResponse{Employee: nil, Exception: "Trouble with request"})
		return
	}

	emp, err := svcs.GetEmployee(data.ID)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetEmployee Problem", "",
				fmt.Sprintf("%s GetEmployee Problem: Employee Not Found", logmsg), c)
			c.JSON(http.StatusNotFound, web.EmployeeResponse{Employee: nil,
				Exception: "Employee Not Found"})
		} else {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetEmployee Problem", "",
				fmt.Sprintf("%s getEmployee Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
				Exception: err.Error()})
		}
		return
	}

	lvID, err := strconv.Atoi(data.OptionalID)
	if err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "Conversion Problem", "",
			fmt.Sprintf("%s Converting LeaveID Problem: %s", logmsg, err.Error()), c)
		c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
			Exception: err.Error()})
		return
	}
	old, err := emp.UpdateLeave(lvID, data.Field, data.Value)
	if err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "UpdateLeave Problem", "",
			fmt.Sprintf("%s Employee UpdateLeave Problem: %s", logmsg, err.Error()), c)
		c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
			Exception: err.Error()})
		return
	}

	err = svcs.UpdateEmployee(emp)
	if err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "UpdateEmployee Problem", "",
			fmt.Sprintf("%s UpdateEmployee Problem: %s", logmsg, err.Error()), c)
		c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
			Exception: err.Error()})
		return
	}

	// return the corrected employee back to the client.
	svcs.CreateDBLogEntry("leaves", "UPDATE", "Manual Update", "",
		fmt.Sprintf("Manual Leave Update for %s, %d (%s): Field: %s, Value: %s",
			emp.Name.GetLastFirstMI(), lvID, old.LeaveDate.Format("01-02-06"),
			data.Field, data.Value), c)
	c.JSON(http.StatusOK, web.EmployeeResponse{Employee: emp, Exception: ""})
}

func AddEmployeeLaborCode(c *gin.Context) {
	var data web.EmployeeLaborCodeRequest
	logmsg := "EmployeeController: AddEmployeeLaborCode:"
	if err := c.ShouldBindJSON(&data); err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "Binding Problem", "",
			fmt.Sprintf("%s Request Data Binding, Trouble with request", logmsg), c)
		c.JSON(http.StatusBadRequest,
			web.EmployeeResponse{Employee: nil, Exception: "Trouble with request"})
		return
	}

	emp, err := svcs.GetEmployee(data.EmployeeID)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetEmployee Problem", "",
				fmt.Sprintf("%s getEmployee Problem: Employee Not Found", logmsg), c)
			c.JSON(http.StatusNotFound, web.EmployeeResponse{Employee: nil,
				Exception: "Employee Not Found"})
		} else {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetEmployee Problem", "",
				fmt.Sprintf("%s getEmployee Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
				Exception: err.Error()})
		}
		return
	}

	for a, asgmt := range emp.Assignments {
		if asgmt.ID == uint(data.AssginmentID) {
			asgmt.AddLaborCode(data.ChargeNumber, data.Extension)
			emp.Assignments[a] = asgmt
		}
	}

	err = svcs.UpdateEmployee(emp)
	if err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "UpdateEmployee Problem", "",
			fmt.Sprintf("%s update employee problem: %s", logmsg, err.Error()), c)
		c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
			Exception: err.Error()})
		return
	}

	// return the corrected employee back to the client.
	c.JSON(http.StatusOK, web.EmployeeResponse{Employee: emp, Exception: ""})
}

func DeleteEmployeeLaborCode(c *gin.Context) {
	empID := c.Param("empid")
	asgmtID := converters.ParseUint(c.Param("asgmt"))
	chgNo := c.Param("chgno")
	ext := c.Param("ext")
	logmsg := "EmployeeController: DeleteEmployeeLaborCode:"

	emp, err := svcs.GetEmployee(empID)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetEmployee Problem", "",
				fmt.Sprintf("%s getEmployee Problem: Employee Not Found", logmsg), c)
			c.JSON(http.StatusNotFound, web.EmployeeResponse{Employee: nil,
				Exception: "Employee Not Found"})
		} else {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetEmployee Problem", "",
				fmt.Sprintf("%s getEmployee Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
				Exception: err.Error()})
		}
		return
	}

	for a, asgmt := range emp.Assignments {
		if asgmt.ID == asgmtID {
			asgmt.RemoveLaborCode(chgNo, ext)
			emp.Assignments[a] = asgmt
		}
	}

	err = svcs.UpdateEmployee(emp)
	if err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "LaborDeletion Problem", "",
			fmt.Sprintf("%s Labor Code deletion problem: %s", logmsg, err.Error()), c)
		c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
			Exception: err.Error()})
		return
	}

	// return the corrected employee back to the client.
	c.JSON(http.StatusOK, web.EmployeeResponse{Employee: emp, Exception: ""})
}

func UpdateContact(c *gin.Context) {
	var data web.EmployeeContactUpdate
	logmsg := "EmployeeController: UpdateContact:"
	if err := c.ShouldBindJSON(&data); err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "Binding Problem", "",
			fmt.Sprintf("%s Request Data Binding, Trouble with request", logmsg), c)
		c.JSON(http.StatusBadRequest,
			web.EmployeeResponse{Employee: nil, Exception: "Trouble with request"})
		return
	}

	emp, err := svcs.GetEmployee(data.EmployeeID)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetEmployee Problem", "",
				fmt.Sprintf("%s getEmployee Problem: Employee Not Found", logmsg), c)
			c.JSON(http.StatusNotFound, web.EmployeeResponse{Employee: nil,
				Exception: "Employee Not Found"})
		} else {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetEmployee Problem", "",
				fmt.Sprintf("%s getEmployee Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
				Exception: err.Error()})
		}
		return
	}

	team, err := svcs.GetTeam(emp.TeamID.Hex())
	if err != nil {
		if err == mongo.ErrNoDocuments {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetTeam Problem", "",
				fmt.Sprintf("%s getTeam Problem: Team Not Found", logmsg), c)
			c.JSON(http.StatusNotFound, web.EmployeeResponse{Employee: nil,
				Exception: "Team Not Found"})
		} else {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetTeam Problem", "",
				fmt.Sprintf("%s getTeam Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
				Exception: err.Error()})
		}
		return
	}

	if data.ContactID == 0 {
		sortid := 0
		for _, ct := range team.ContactTypes {
			if ct.Id == data.TypeID {
				sortid = ct.SortID
			}
		}
		emp.AddContactInfo(data.TypeID, data.Value, sortid)
	} else {
		if data.Value != "" {
			emp.AddContactInfo(data.TypeID, data.Value, 0)
		} else {
			emp.DeleteContactInfo(data.ContactID)
		}
	}

	err = svcs.UpdateEmployee(emp)
	if err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "UpdateEmployee Problem", "",
			fmt.Sprintf("%s update employee problem: %s", logmsg, err.Error()), c)
		c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
			Exception: err.Error()})
		return
	}

	// return the corrected employee back to the client.
	c.JSON(http.StatusOK, web.EmployeeResponse{Employee: emp, Exception: ""})
}

func UpdateSpecialty(c *gin.Context) {
	var data web.EmployeeSpecialtyUpdate
	logmsg := "EmployeeController: UpdateSpecialty:"
	if err := c.ShouldBindJSON(&data); err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "Binding Problem", "",
			fmt.Sprintf("%s Request Data Binding, Trouble with request", logmsg), c)
		c.JSON(http.StatusBadRequest,
			web.EmployeeResponse{Employee: nil, Exception: "Trouble with request"})
		return
	}

	emp, err := svcs.GetEmployee(data.EmployeeID)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetEmployee Problem", "",
				fmt.Sprintf("%s getEmployee Problem: Employee Not Found", logmsg), c)
			c.JSON(http.StatusNotFound, web.EmployeeResponse{Employee: nil,
				Exception: "Employee Not Found"})
		} else {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetEmployee Problem", "",
				fmt.Sprintf("%s getEmployee Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
				Exception: err.Error()})
		}
		return
	}

	team, err := svcs.GetTeam(emp.TeamID.Hex())
	if err != nil {
		if err == mongo.ErrNoDocuments {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetTeam Problem", "",
				fmt.Sprintf("%s getTeam Problem: Team Not Found", logmsg), c)
			c.JSON(http.StatusNotFound, web.EmployeeResponse{Employee: nil,
				Exception: "Team Not Found"})
		} else {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetTeam Problem", "",
				fmt.Sprintf("%s getTeam Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
				Exception: err.Error()})
		}
		return
	}

	if data.Value {
		sortid := 0
		for _, ct := range team.SpecialtyTypes {
			if ct.Id == data.TypeID {
				sortid = ct.SortID
			}
		}
		emp.AddSpecialty(data.TypeID, data.Value, sortid)
	} else {
		emp.DeleteSpecialty(data.SpecialtyID)
	}

	err = svcs.UpdateEmployee(emp)
	if err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "UpdateEmployee Problem", "",
			fmt.Sprintf("%s update employee problem: %s", logmsg, err.Error()), c)
		c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
			Exception: err.Error()})
		return
	}

	// return the corrected employee back to the client.
	c.JSON(http.StatusOK, web.EmployeeResponse{Employee: emp, Exception: ""})
}

func UpdateSpecialties(c *gin.Context) {
	var data web.EmployeeSpecialtiesUpdate
	logmsg := "EmployeeController: UpdateSpecialties:"
	if err := c.ShouldBindJSON(&data); err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "Binding Problem", "",
			fmt.Sprintf("%s Request Data Binding, Trouble with request", logmsg), c)
		c.JSON(http.StatusBadRequest,
			web.EmployeeResponse{Employee: nil, Exception: "Trouble with request"})
		return
	}

	emp, err := svcs.GetEmployee(data.EmployeeID)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetEmployee Problem", "",
				fmt.Sprintf("%s getEmployee Problem: Employee Not Found", logmsg), c)
			c.JSON(http.StatusNotFound, web.EmployeeResponse{Employee: nil,
				Exception: "Employee Not Found"})
		} else {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetEmployee Problem", "",
				fmt.Sprintf("%s getEmployee Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
				Exception: err.Error()})
		}
		return
	}

	team, err := svcs.GetTeam(emp.TeamID.Hex())
	if err != nil {
		if err == mongo.ErrNoDocuments {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetTeam Problem", "",
				fmt.Sprintf("%s getTeam Problem: Team Not Found", logmsg), c)
			c.JSON(http.StatusNotFound, web.EmployeeResponse{Employee: nil,
				Exception: "Team Not Found"})
		} else {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetTeam Problem", "",
				fmt.Sprintf("%s getTeam Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
				Exception: err.Error()})
		}
		return
	}

	if strings.EqualFold(data.Action, "add") {
		for _, sid := range data.Specialties {
			sortid := 0
			for _, ct := range team.SpecialtyTypes {
				if sid == ct.Id {
					sortid = ct.SortID
				}
			}
			emp.AddSpecialty(sid, true, sortid)
		}
	} else {
		for _, sid := range data.Specialties {
			emp.DeleteSpecialty(sid)
		}
	}

	err = svcs.UpdateEmployee(emp)
	if err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "UpdateEmployee Problem", "",
			fmt.Sprintf("%s update employee problem: %s", logmsg, err.Error()), c)
		c.JSON(http.StatusBadRequest, web.EmployeeResponse{Employee: nil,
			Exception: err.Error()})
		return
	}

	// return the corrected employee back to the client.
	c.JSON(http.StatusOK, web.EmployeeResponse{Employee: emp, Exception: ""})
}

func GetEmployeeWork(c *gin.Context) {
	employeeID := c.Param("employee")
	sYear := c.Param("year")
	logmsg := "EmployeeController: GetEmployeeWork:"

	year, err := strconv.Atoi(sYear)
	if err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "Conversion Problem", "",
			fmt.Sprintf("%s Year conversion from string", logmsg), c)
		c.JSON(http.StatusBadRequest,
			web.EmployeeResponse{Employee: nil, Exception: err.Error()})
		return
	}

	rec, err := svcs.GetEmployeeWork(employeeID, uint(year))
	if err != nil {
		if err == mongo.ErrNoDocuments {
			tempid, _ := primitive.ObjectIDFromHex(employeeID)
			rec = &employees.EmployeeWorkRecord{
				ID:         primitive.NewObjectID(),
				EmployeeID: tempid,
				Year:       uint(year),
				Work:       make([]employees.Work, 0),
			}
		} else {
			svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetWork Problem", "",
				fmt.Sprintf("%s Getting Work Record: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusBadRequest,
				web.EmployeeResponse{Employee: nil, Exception: err.Error()})
			return
		}
	}

	response := web.EmployeeWorkResponse{
		EmployeeID:   employeeID,
		Year:         year,
		EmployeeWork: rec.Work,
	}

	c.JSON(http.StatusOK, response)
}
