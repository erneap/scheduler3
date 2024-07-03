package controllers

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/erneap/go-models/logs"
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

func GetLogEntriesWithFilter(c *gin.Context) {
	var data web.LogRequest

	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest,
			web.LogResponse{Entries: nil, Exception: "Trouble with request"})
		return
	}

	entries, err := services.GetLogEntries(c, data.Portion, data.Year)
	if err != nil {
		c.JSON(http.StatusBadRequest,
			web.LogResponse{Entries: nil, Exception: err.Error()})
		return
	}

	if len(data.Filter) > 0 {
		tEntries := make([]logs.LogEntry2, 0)

		for _, entry := range entries {
			bAdd := false
			for _, filter := range data.Filter {
				if !bAdd {
					if strings.Contains(strings.ToLower(entry.Message), strings.ToLower(filter)) ||
						strings.Contains(strings.ToLower(entry.Category), strings.ToLower(filter)) ||
						strings.Contains(strings.ToLower(entry.Title), strings.ToLower(filter)) ||
						strings.Contains(strings.ToLower(entry.Name), strings.ToLower(filter)) {
						bAdd = true
						tEntries = append(tEntries, entry)
					}
				}
			}
		}
		entries = tEntries
	}

	c.JSON(http.StatusOK, web.LogResponse{Entries: entries, Exception: ""})
}
