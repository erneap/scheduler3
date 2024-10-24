package controllers

import (
	"net/http"
	"sort"
	"strings"
	"time"

	"github.com/erneap/go-models/general"
	"github.com/erneap/go-models/svcs"
	"github.com/erneap/scheduler3/general-api/models"
	"github.com/gin-gonic/gin"
)

// The logs controller will hold only retrieval functions, because all log
// entries are created in other applications/functions and posted to the
// database there.  We will use this to review any log entry for troubleshooting
// or other purpose.
func GetLogApplications(c *gin.Context) {
	var applist models.LogApplicationList
	logs, err := svcs.GetDBLogEntriesAll()
	if err != nil {
		c.JSON(http.StatusBadRequest,
			models.LogApplicationList{
				Exception: "Trouble getting log applications: " + err.Error()})
		return
	}
	for _, entry := range logs {
		found := false
		for _, app := range applist.List {
			if strings.EqualFold(app, entry.Application) {
				found = true
			}
		}
		if !found {
			applist.List = append(applist.List, entry.Application)
		}
	}
	sort.Strings(applist.List)
	c.JSON(http.StatusOK, applist)
}

func GetLogEntriesByApplication(c *gin.Context) {
	app := c.Param("app")
	start := c.Param("start")
	end := c.Param("end")
	var logs []general.LogEntry
	var err error
	if start != "" {
		dStart, err := time.ParseInLocation("2006-01-02", start, time.UTC)
		if err != nil {
			c.JSON(http.StatusBadRequest,
				models.LogList{
					Exception: "Trouble getting log entries: " + err.Error()})
			return
		}
		dEnd := time.Now().UTC()
		if end != "" {
			dEnd, err = time.ParseInLocation("2006-01-02", end, time.UTC)
			if err != nil {
				c.JSON(http.StatusBadRequest,
					models.LogList{
						Exception: "Trouble getting log entries: " + err.Error()})
				return
			}
			dEnd = dEnd.AddDate(0, 0, 1)
		}
		logs, err = svcs.GetDBLogEntriesByApplicationBetweenDates(app, dStart, dEnd)
		if err != nil {
			c.JSON(http.StatusBadRequest,
				models.LogList{
					Exception: "Trouble getting log entries: " + err.Error()})
			return
		}
	} else {
		logs, err = svcs.GetDBLogEntriesByApplication(app)
		if err != nil {
			c.JSON(http.StatusBadRequest,
				models.LogList{
					Exception: "Trouble getting log entries: " + err.Error()})
			return
		}
	}
	var ans models.LogList
	ans.List = append(ans.List, logs...)
	sort.Sort(sort.Reverse(general.ByLogEntries(ans.List)))
	c.JSON(http.StatusOK, ans)
}

func GetLogEntriesByApplicationCategory(c *gin.Context) {
	app := c.Param("app")
	cat := c.Param("category")
	start := c.Param("start")
	end := c.Param("end")
	var logs []general.LogEntry
	var err error
	if start != "" {
		dStart, err := time.ParseInLocation("2006-01-02", start, time.UTC)
		if err != nil {
			c.JSON(http.StatusBadRequest,
				models.LogList{
					Exception: "Trouble getting log entries: " + err.Error()})
			return
		}
		dEnd := time.Now().UTC()
		if end != "" {
			dEnd, err = time.ParseInLocation("2006-01-02", end, time.UTC)
			if err != nil {
				c.JSON(http.StatusBadRequest,
					models.LogList{
						Exception: "Trouble getting log entries: " + err.Error()})
				return
			}
			dEnd = dEnd.AddDate(0, 0, 1)
		}
		logs, err = svcs.GetDBLogEntriesByApplicationCategoryBetweenDates(app, cat, dStart, dEnd)
		if err != nil {
			c.JSON(http.StatusBadRequest,
				models.LogList{
					Exception: "Trouble getting log entries: " + err.Error()})
			return
		}
	} else {
		logs, err = svcs.GetDBLogEntriesByApplicationCategory(app, cat)
		if err != nil {
			c.JSON(http.StatusBadRequest,
				models.LogList{
					Exception: "Trouble getting log entries: " + err.Error()})
			return
		}
	}
	var ans models.LogList
	ans.List = append(ans.List, logs...)
	sort.Sort(sort.Reverse(general.ByLogEntries(ans.List)))
	c.JSON(http.StatusOK, ans)
}
