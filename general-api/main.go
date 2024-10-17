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
		}
	}

	// listen on port 6003
	router.Run(":7004")
}
