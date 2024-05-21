package controllers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/erneap/scheduler2/schedulerApi/models/web"
	"github.com/erneap/scheduler2/schedulerApi/services"
	"github.com/gin-gonic/gin"
)

func AddLogEntry(c *gin.Context) {
	var data web.AddLogEntry

	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest,
			web.LogResponse{Entries: nil, Exception: "Trouble with request"})
		return
	}

	services.AddLogEntry(c, data.Portion, data.Category, data.Title, data.Message)
	now := time.Now()

	entries, err := services.GetLogEntries(c, data.Portion, now.Year())
	if err != nil {
		c.JSON(http.StatusBadRequest,
			web.LogResponse{Entries: nil, Exception: err.Error()})
		return
	}

	c.JSON(http.StatusOK, web.LogResponse{Entries: entries, Exception: ""})
}

func GetLogEntries(c *gin.Context) {
	portion := c.Param("portion")
	year, err := strconv.Atoi(c.Param("year"))
	if err != nil {
		c.JSON(http.StatusBadRequest,
			web.LogResponse{Entries: nil, Exception: err.Error()})
		return
	}

	entries, err := services.GetLogEntries(c, portion, year)
	if err != nil {
		c.JSON(http.StatusBadRequest,
			web.LogResponse{Entries: nil, Exception: err.Error()})
		return
	}

	c.JSON(http.StatusOK, web.LogResponse{Entries: entries, Exception: ""})
}
