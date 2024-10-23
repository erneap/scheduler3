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
			rpts.GET("/list/:typeid", controllers.GetReportList)
			rpts.GET("/list/", controllers.GetReportList)
		}
		report := api.Group("/report")
		{
			report.GET("/:id", controllers.GetReport)
			report.POST("/", controllers.CreateReport)
		}
	}

	// listen on port 7004
	router.Run(":7004")
}
