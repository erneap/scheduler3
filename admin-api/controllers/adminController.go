package controllers

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/erneap/go-models/employees"
	"github.com/erneap/go-models/svcs"
	"github.com/erneap/scheduler3/scheduler-api/models/web"
	"github.com/erneap/scheduler3/scheduler-api/services"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func GetTeams(c *gin.Context) {
	teams, err := services.GetTeams()
	logmsg := "TeamController: GetTeams:"
	if err != nil {
		svcs.CreateDBLogEntry("scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s GetTeams: %s", logmsg, err.Error()), c)
		c.JSON(http.StatusBadRequest, web.TeamsResponse{
			Exception: err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, web.TeamsResponse{
		Teams: teams,
	})
}

func CreateTeam(c *gin.Context) {
	var data web.CreateTeamRequest
	logmsg := "TeamController: CreateTeam:"

	if err := c.ShouldBindJSON(&data); err != nil {
		svcs.CreateDBLogEntry("scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s DataBinding: %s", logmsg, err.Error()), c)
		c.JSON(http.StatusBadRequest,
			web.SiteResponse{Team: nil, Site: nil, Exception: "Trouble with request"})
		return
	}

	teams, err := services.GetTeams()
	if err != nil {
		svcs.CreateDBLogEntry("scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s GetTeams: %s", logmsg, err.Error()), c)
		c.JSON(http.StatusBadRequest, web.SiteResponse{Team: nil, Site: nil,
			Exception: "No Teams Available"})
		return
	}

	for _, tm := range teams {
		if strings.EqualFold(tm.Name, data.Name) {
			svcs.CreateDBLogEntry("scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s Team Already Created: %s", logmsg, tm.Name))
			c.JSON(http.StatusOK, web.SiteResponse{Team: &tm, Site: nil,
				Exception: ""})
			return
		}
	}

	team := services.CreateTeam(data.Name, data.UseStdWorkcodes)

	site, err := services.CreateSite(team.ID.Hex(), "leads", "Leads")
	if err != nil {
		svcs.CreateDBLogEntry("scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s CreateSite: %s", logmsg, err.Error()), c)
		c.JSON(http.StatusBadRequest, web.SiteResponse{Team: nil, Site: nil,
			Exception: err.Error()})
		return
	}

	team.Sites = append(team.Sites, *site)

	// add team leader from data provided
	emp := employees.Employee{
		TeamID: team.ID,
		SiteID: "leads",
		Email:  data.Leader.EmailAddress,
		Name: employees.EmployeeName{
			FirstName:  data.Leader.FirstName,
			MiddleName: data.Leader.MiddleName,
			LastName:   data.Leader.LastName,
		},
	}
	emp.AddAssignment("leads", "leads", time.Now().UTC())
	_, err = services.CreateEmployee(emp, data.Leader.Password,
		"scheduler-teamleader", team.ID.Hex(), "leads")
	if err != nil {
		svcs.CreateDBLogEntry("scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s CreateLeader: %s", logmsg, err.Error()), c)
	}

	c.JSON(http.StatusOK, web.SiteResponse{Team: team, Site: nil, Exception: ""})
}

func UpdateTeam(c *gin.Context) {
	var data web.UpdateTeamRequest
	logmsg := "TeamController: UpdateTeam:"

	if err := c.ShouldBindJSON(&data); err != nil {
		svcs.CreateDBLogEntry("scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s DataBinding: %s", logmsg, err.Error()), c)
		c.JSON(http.StatusBadRequest,
			web.SiteResponse{Team: nil, Site: nil, Exception: "Trouble with request"})
		return
	}

	team, err := services.GetTeam(data.TeamID)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			svcs.CreateDBLogEntry("scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s GetTeam: %s", logmsg, "Team Not Found"))
			c.JSON(http.StatusNotFound, web.SiteResponse{Team: nil, Site: nil,
				Exception: "Team Not Found"})
		} else {
			svcs.CreateDBLogEntry("scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s GetTeam Error: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusBadRequest, web.SiteResponse{Team: nil, Site: nil,
				Exception: err.Error()})
		}
		return
	}

	team.Name = data.Value

	if err = services.UpdateTeam(team); err != nil {
		svcs.CreateDBLogEntry("scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s UpdateTeam: %s", logmsg, err.Error()), c)
		c.JSON(http.StatusBadRequest, web.SiteResponse{Team: nil, Site: nil,
			Exception: err.Error()})
	}

	c.JSON(http.StatusOK, web.SiteResponse{Team: team, Site: nil, Exception: ""})
}

func DeleteTeam(c *gin.Context) {
	teamID := c.Param("teamid")
	logmsg := "TeamController: DeleteTeam:"

	tID, err := primitive.ObjectIDFromHex(teamID)
	if err != nil {
		svcs.CreateDBLogEntry("scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s Team ID Conversion: %s", logmsg, err.Error()), c)
		c.JSON(http.StatusBadRequest, web.TeamsResponse{Teams: nil,
			Exception: err.Error()})
	}

	// get list of employees that are assigned to the team
	employees, err := services.GetEmployeesForTeam(teamID)
	if err != nil {
		svcs.CreateDBLogEntry("scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s GetEmployeesForTeam: %s", logmsg, err.Error()), c)
		c.JSON(http.StatusBadRequest, web.TeamsResponse{Teams: nil,
			Exception: err.Error()})
	}

	for _, emp := range employees {
		err = services.DeleteEmployee(emp.ID.Hex())
		if err != nil {
			svcs.CreateDBLogEntry("scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s Delete Employee: %s: Error: %s", logmsg, emp.ID.Hex(), err.Error()), c)
		}
		err = svcs.DeleteUser(emp.ID.Hex())
		if err != nil {
			svcs.CreateDBLogEntry("scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s Delete User: %s: %s", logmsg, emp.ID.Hex(), err.Error()), c)
		}
	}

	err = services.DeleteTeam(tID)
	if err != nil {
		svcs.CreateDBLogEntry("scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s DeleteTeam: %s", logmsg, err.Error()), c)
		c.JSON(http.StatusBadRequest, web.TeamsResponse{Teams: nil,
			Exception: err.Error()})
		return
	}

	teams, err := services.GetTeams()
	if err != nil {
		svcs.CreateDBLogEntry("scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s GetTeams: %s", logmsg, err.Error()), c)
		c.JSON(http.StatusBadRequest, web.TeamsResponse{Teams: nil,
			Exception: err.Error()})
	}

	c.JSON(http.StatusOK, web.TeamsResponse{Teams: teams, Exception: ""})
}

func Purge(c *gin.Context) {
	sDate := c.Param("purge")
	format := "20060102"

	purgeDate, err := time.Parse(format, sDate)
	if err != nil {
		svcs.CreateDBLogEntry("scheduler", "ERROR", "PROBLEM",
			fmt.Sprintf("Purge Date Parsing Problem: %s", err.Error()), c)
		c.JSON(http.StatusBadRequest,
			web.TeamsResponse{Teams: nil, Exception: err.Error()})
		return
	}

	// purge employee work records prior to purge date.
	workrecords, err := services.GetEmployeeWorkForPurge(purgeDate)
	if err != nil {
		svcs.CreateDBLogEntry("scheduler", "ERROR", "PROBLEM",
			fmt.Sprintf("Get Work Records Problem: %s", err.Error()), c)
		c.JSON(http.StatusBadRequest,
			web.TeamsResponse{Teams: nil, Exception: err.Error()})
		return
	}

	for _, rec := range workrecords {
		rec.Purge(purgeDate)
		if len(rec.Work) > 0 {
			services.UpdateEmployeeWork(&rec)
		} else {
			services.DeleteEmployeeWork(rec.EmployeeID.Hex(), rec.Year)
		}
	}

	// purge employee's leave balance records,variations and leave before purge
	// date, plus check to see if employee quit before the purge date.
	employees, _ := services.GetAllEmployees()
	for _, emp := range employees {
		bQuit := emp.PurgeOldData(purgeDate)
		if bQuit {
			services.DeleteEmployee(emp.ID.Hex())
		} else {
			services.UpdateEmployee(&emp)
		}
	}

	// update teams of holiday dates before the purge date.
	teams, _ := services.GetTeams()
	for t, tm := range teams {
		tm.PurgeOldData(purgeDate)
		teams[t] = tm
		services.UpdateTeam(&tm)
	}

	c.JSON(http.StatusOK, web.TeamsResponse{Teams: teams, Exception: ""})
}
