package main

import (
	"fmt"

	"github.com/erneap/go-models/config"
	"github.com/erneap/scheduler3/general-api/controllers"
	"github.com/gin-gonic/gin"
)

func main() {
	fmt.Println("Starting")

	// run database
	config.ConnectDB()

	// add routes
	router := gin.Default()
	api := router.Group("/api/v2/general")
	{
		rpts := api.Group("/reports")
		{
			rpts.GET("/types/:app", controllers.GetReportTypes)
			rpts.POST("/list", controllers.GetReportList)
		}
		report := api.Group("/report")
		{
			report.GET("/:id", controllers.GetReport)
			report.POST("/", controllers.CreateReport)
		}
		logs := api.Group("/logs")
		{
			logs.GET("/app/cat/:app/:category/:start/:end",
				controllers.GetLogEntriesByApplicationCategory)
			logs.GET("/app/cat/:app/:category/:start",
				controllers.GetLogEntriesByApplicationCategory)
			logs.GET("/app/cat/:app/:category",
				controllers.GetLogEntriesByApplicationCategory)
			logs.GET("/app/:app/:start/:end", controllers.GetLogEntriesByApplication)
			logs.GET("/app/:app/:start", controllers.GetLogEntriesByApplication)
			logs.GET("/app/:app", controllers.GetLogEntriesByApplication)
			logs.GET("/apps", controllers.GetLogApplications)
		}
	}

	// listen on port 7004
	router.Run(":7005")
}
