package main

import (
	"fmt"

	"github.com/erneap/go-models/config"
	"github.com/erneap/go-models/svcs"
	"github.com/erneap/scheduler2/schedulerApi/controllers"
	"github.com/gin-gonic/gin"
)

func main() {
	fmt.Println("Starting")

	// run database
	config.ConnectDB()

	// add routes
	router := gin.Default()
	roles := []string{"ADMIN", "SCHEDULER", "siteleader", "company", "teamleader"}
	siteRoles := []string{"SCHEDULER", "siteleader", "company", "teamleader", "ADMIN"}
	teamRoles := []string{"teamleader", "ADMIN"}
	api := router.Group("/api/v2/admin", svcs.CheckJWT("scheduler"))
	{
		api.GET("/teams", controllers.GetTeams,
			svcs.CheckRoles("scheduler", teamRoles))
		api.POST("/teams", controllers.CreateTeam,
			svcs.CheckRole("scheduler", "admin"))
		api.DELETE("/teams/:teamid", controllers.DeleteTeam,
			svcs.CheckRoles("scheduler", teamRoles))
		api.DELETE("/purge/:purge", controllers.Purge,
			svcs.CheckRoles("scheduler", teamRoles))

		api.POST("/report/", controllers.CreateReport,
			svcs.CheckRoles("scheduler", siteRoles))

		notes := api.Group("/messages")
		{
			notes.GET("/", controllers.GetAllMessages)
			notes.GET("/message/:id", controllers.GetMessage)
			notes.GET("/employee/:userid", controllers.GetMessagesForEmployee)
			notes.POST("/", controllers.CreateMessage)
			notes.PUT("/acknowledge", controllers.AcknowledgeMessages)
		}

		logs := api.Group("/logs", svcs.CheckRoles("scheduler", roles))
		{
			logs.GET("/:portion/:year", controllers.GetLogEntries)
			logs.POST("/", controllers.AddLogEntry)
		}
	}

	// listen on port 6006
	router.Run(":6006")
}
