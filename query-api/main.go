package main

import (
	"fmt"

	"github.com/erneap/go-models/config"
	"github.com/erneap/scheduler2/queryApi/controllers"
	"github.com/gin-gonic/gin"
)

func main() {
	fmt.Println("Starting")

	// run database
	config.ConnectDB()

	// add routes
	router := gin.Default()
	api := router.Group("/api/v2/query")
	{

		api.GET("/:teamid", controllers.BasicQuery)
		api.POST("/", controllers.ComplexQuery)
	}

	// listen on port 6003
	router.Run(":6003")
}
