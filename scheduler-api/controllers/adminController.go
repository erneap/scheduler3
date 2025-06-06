package controllers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/erneap/models/v2/svcs"
	"github.com/erneap/scheduler3/scheduler-api/models/web"
	"github.com/gin-gonic/gin"
)

func Purge(c *gin.Context) {
	sDate := c.Param("purge")
	format := "20060102"

	purgeDate, err := time.Parse(format, sDate)
	if err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "Purge Problem", "",
			fmt.Sprintf("Purge Date Parsing Problem: %s", err.Error()), c)
		c.JSON(http.StatusBadRequest,
			web.TeamsResponse{Teams: nil, Exception: err.Error()})
		return
	}

	// purge employee work records prior to purge date.
	workrecords, err := svcs.GetEmployeeWorkForPurge(purgeDate)
	if err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetWork Problem", "",
			fmt.Sprintf("Get Work Records Problem: %s", err.Error()), c)
		c.JSON(http.StatusBadRequest,
			web.TeamsResponse{Teams: nil, Exception: err.Error()})
		return
	}

	for _, rec := range workrecords {
		rec.Purge(purgeDate)
		if len(rec.Work) > 0 {
			svcs.UpdateEmployeeWork(&rec)
		} else {
			svcs.DeleteEmployeeWork(rec.EmployeeID.Hex(), rec.Year)
		}
	}

	// purge employee's leave balance records,variations and leave before purge
	// date, plus check to see if employee quit before the purge date.
	employees, _ := svcs.GetAllEmployees()
	for _, emp := range employees {
		bQuit := emp.PurgeOldData(purgeDate)
		if bQuit {
			svcs.DeleteEmployee(emp.ID.Hex())
		} else {
			svcs.UpdateEmployee(&emp)
		}
	}

	// update teams of holiday dates before the purge date.
	teams, _ := svcs.GetTeams()
	for t, tm := range teams {
		tm.PurgeOldData(purgeDate)
		teams[t] = tm
		svcs.UpdateTeam(&tm)
	}

	c.JSON(http.StatusOK, web.TeamsResponse{Teams: teams, Exception: ""})
}
