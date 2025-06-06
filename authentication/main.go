package main

import (
	"fmt"

	"github.com/erneap/authentication/controllers"
	"github.com/erneap/models/v2/config"
	"github.com/erneap/models/v2/svcs"
	"github.com/gin-gonic/gin"
)

func main() {
	fmt.Println("Starting")

	// run database
	config.ConnectDB()

	// add routes
	router := gin.Default()
	adminRoles := []string{"metrics-admin", "scheduler-scheduler",
		"scheduler-siteleader", "scheduler-teamleader", "scheduler-admin"}
	api := router.Group("/api/v2/authentication")
	{
		authenticate := api.Group("/authenticate")
		{
			authenticate.POST("/", controllers.Login)
			authenticate.PUT("/", svcs.CheckJWT("authentication"),
				controllers.RenewToken)
			authenticate.DELETE("/:userid/:application",
				svcs.CheckJWT("authentication"), controllers.Logout)
		}
		user := api.Group("/user")
		{
			user.GET("/:userid", svcs.CheckRoleList("authentication", adminRoles),
				controllers.GetUser)
			user.POST("/", svcs.CheckRoleList("authentication", adminRoles), controllers.AddUser)
			user.PUT("/", svcs.CheckJWT("authentication"), controllers.UpdateUser)
			user.DELETE("/:userid", svcs.CheckRoleList("authentication", adminRoles),
				controllers.DeleteUser)
		}
		reset := api.Group("/reset")
		{
			reset.POST("/", controllers.StartPasswordReset)
			reset.PUT("/", controllers.PasswordReset)
		}
		api.GET("/users", svcs.CheckRoleList("authentication", adminRoles), controllers.GetUsers)
	}

	// listen on port 6000
	router.Run(":7004")
}
