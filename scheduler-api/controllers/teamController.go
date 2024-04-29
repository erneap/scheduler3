package controllers

import (
	"fmt"
	"net/http"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/erneap/go-models/employees"
	"github.com/erneap/go-models/svcs"
	"github.com/erneap/go-models/teams"
	"github.com/erneap/scheduler2/schedulerApi/models/web"
	"github.com/erneap/scheduler2/schedulerApi/services"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func GetTeam(c *gin.Context) {
	teamID := c.Param("teamid")
	logmsg := "TeamController: GetTeam:"

	team, err := services.GetTeam(teamID)
	if err != nil {
		services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s Error: %s", logmsg, err.Error()))
		c.JSON(http.StatusBadRequest, web.SiteResponse{Team: nil, Site: nil,
			Exception: "Team not found"})
		return
	}

	c.JSON(http.StatusOK, web.SiteResponse{Team: team, Site: nil, Exception: ""})
}

func GetTeams(c *gin.Context) {
	teams, err := services.GetTeams()
	logmsg := "TeamController: GetTeams:"
	if err != nil {
		services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s GetTeams: %s", logmsg, err.Error()))
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
		services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s DataBinding: %s", logmsg, err.Error()))
		c.JSON(http.StatusBadRequest,
			web.SiteResponse{Team: nil, Site: nil, Exception: "Trouble with request"})
		return
	}

	teams, err := services.GetTeams()
	if err != nil {
		services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s GetTeams: %s", logmsg, err.Error()))
		c.JSON(http.StatusBadRequest, web.SiteResponse{Team: nil, Site: nil,
			Exception: "No Teams Available"})
		return
	}

	for _, tm := range teams {
		if strings.EqualFold(tm.Name, data.Name) {
			services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s Team Already Created: %s", logmsg, tm.Name))
			c.JSON(http.StatusOK, web.SiteResponse{Team: &tm, Site: nil,
				Exception: ""})
			return
		}
	}

	team := services.CreateTeam(data.Name, data.UseStdWorkcodes)

	site, err := services.CreateSite(team.ID.Hex(), "leads", "Leads")
	if err != nil {
		services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s CreateSite: %s", logmsg, err.Error()))
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
		services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s CreateLeader: %s", logmsg, err.Error()))
	}

	c.JSON(http.StatusOK, web.SiteResponse{Team: team, Site: nil, Exception: ""})
}

func UpdateTeam(c *gin.Context) {
	var data web.UpdateTeamRequest
	logmsg := "TeamController: UpdateTeam:"

	if err := c.ShouldBindJSON(&data); err != nil {
		services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s DataBinding: %s", logmsg, err.Error()))
		c.JSON(http.StatusBadRequest,
			web.SiteResponse{Team: nil, Site: nil, Exception: "Trouble with request"})
		return
	}

	team, err := services.GetTeam(data.TeamID)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s GetTeam: %s", logmsg, "Team Not Found"))
			c.JSON(http.StatusNotFound, web.SiteResponse{Team: nil, Site: nil,
				Exception: "Team Not Found"})
		} else {
			services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s GetTeam Error: %s", logmsg, err.Error()))
			c.JSON(http.StatusBadRequest, web.SiteResponse{Team: nil, Site: nil,
				Exception: err.Error()})
		}
		return
	}

	team.Name = data.Value

	if err = services.UpdateTeam(team); err != nil {
		services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s UpdateTeam: %s", logmsg, err.Error()))
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
		services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s Team ID Conversion: %s", logmsg, err.Error()))
		c.JSON(http.StatusBadRequest, web.TeamsResponse{Teams: nil,
			Exception: err.Error()})
	}

	// get list of employees that are assigned to the team
	employees, err := services.GetEmployeesForTeam(teamID)
	if err != nil {
		services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s GetEmployeesForTeam: %s", logmsg, err.Error()))
		c.JSON(http.StatusBadRequest, web.TeamsResponse{Teams: nil,
			Exception: err.Error()})
	}

	for _, emp := range employees {
		err = services.DeleteEmployee(emp.ID.Hex())
		if err != nil {
			services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s Delete Employee: %s: Error: %s", logmsg, emp.ID.Hex(), err.Error()))
		}
		err = svcs.DeleteUser(emp.ID.Hex())
		if err != nil {
			services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s Delete User: %s: %s", logmsg, emp.ID.Hex(), err.Error()))
		}
	}

	err = services.DeleteTeam(tID)
	if err != nil {
		services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s DeleteTeam: %s", logmsg, err.Error()))
		c.JSON(http.StatusBadRequest, web.TeamsResponse{Teams: nil,
			Exception: err.Error()})
		return
	}

	teams, err := services.GetTeams()
	if err != nil {
		services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s GetTeams: %s", logmsg, err.Error()))
		c.JSON(http.StatusBadRequest, web.TeamsResponse{Teams: nil,
			Exception: err.Error()})
	}

	c.JSON(http.StatusOK, web.TeamsResponse{Teams: teams, Exception: ""})
}

func CreateWorkcode(c *gin.Context) {
	var data web.CreateTeamWorkcodeRequest
	logmsg := "TeamController: CreateWorkcode:"

	if err := c.ShouldBindJSON(&data); err != nil {
		services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s DataBinding: %s", logmsg, err.Error()))
		c.JSON(http.StatusBadRequest,
			web.SiteResponse{Team: nil, Site: nil, Exception: "Trouble with request"})
		return
	}

	team, err := services.GetTeam(data.TeamID)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s GetTeam: %s", logmsg, "Team Not Found"))
			c.JSON(http.StatusNotFound, web.SiteResponse{Team: nil, Site: nil,
				Exception: "Team Not Found"})
		} else {
			services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s GetTeam Error: %s", logmsg, err.Error()))
			c.JSON(http.StatusBadRequest, web.SiteResponse{Team: nil, Site: nil,
				Exception: err.Error()})
		}
		return
	}

	found := false
	for w, wCode := range team.Workcodes {
		if strings.EqualFold(wCode.Id, data.Id) {
			wCode.Title = data.Title
			wCode.BackColor = data.BackColor
			wCode.TextColor = data.TextColor
			wCode.IsLeave = data.IsLeave
			wCode.ShiftCode = data.ShiftCode
			wCode.AltCode = data.AltCode
			wCode.Search = data.Search
			wCode.StartTime = data.StartTime
			found = true
			team.Workcodes[w] = wCode
		}
	}
	if !found {
		wCode := teams.Workcode{
			Id:        data.Id,
			Title:     data.Title,
			StartTime: data.StartTime,
			ShiftCode: data.ShiftCode,
			AltCode:   data.AltCode,
			Search:    data.Search,
			IsLeave:   data.IsLeave,
			BackColor: data.BackColor,
			TextColor: data.TextColor,
		}
		team.Workcodes = append(team.Workcodes, wCode)
		sort.Sort(teams.ByWorkcode(team.Workcodes))
	}

	if err = services.UpdateTeam(team); err != nil {
		services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s UpdateTeam: %s", logmsg, err.Error()))
		c.JSON(http.StatusBadRequest, web.SiteResponse{Team: nil, Site: nil,
			Exception: err.Error()})
		return
	}

	c.JSON(http.StatusOK, web.SiteResponse{Team: team, Site: nil, Exception: ""})
}

func UpdateTeamWorkcode(c *gin.Context) {
	var data web.UpdateTeamRequest
	logmsg := "TeamController: UpdateTeamWorkcode:"

	if err := c.ShouldBindJSON(&data); err != nil {
		services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s DataBinding: %s", logmsg, err.Error()))
		c.JSON(http.StatusBadRequest,
			web.SiteResponse{Team: nil, Site: nil, Exception: "Trouble with request"})
		return
	}

	team, err := services.GetTeam(data.TeamID)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s GetTeam: %s", logmsg, "Team Not Found"))
			c.JSON(http.StatusNotFound, web.SiteResponse{Team: nil, Site: nil,
				Exception: "Team Not Found"})
		} else {
			services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s GetTeam Error: %s", logmsg, err.Error()))
			c.JSON(http.StatusBadRequest, web.SiteResponse{Team: nil, Site: nil,
				Exception: err.Error()})
		}
		return
	}

	for w, wCode := range team.Workcodes {
		if strings.EqualFold(wCode.Id, data.AdditionalID) {
			switch strings.ToLower(data.Field) {
			case "title":
				wCode.Title = data.Value
			case "start", "starttime":
				tTime, _ := strconv.ParseUint(data.Value, 10, 64)
				wCode.StartTime = tTime
			case "shift", "shiftcode", "premimum":
				wCode.ShiftCode = data.Value
			case "isleave", "leave":
				wCode.IsLeave = strings.EqualFold(data.Value, "true")
			case "back", "bkg", "backcolor":
				wCode.BackColor = data.Value
			case "fore", "text", "textcolor":
				wCode.TextColor = data.Value
			case "alt", "altcode":
				wCode.AltCode = data.Value
			case "search":
				wCode.Search = data.Value
			case "colors":
				colors := strings.Split(data.Value, "-")
				wCode.TextColor = colors[0]
				wCode.BackColor = colors[1]
			}
			team.Workcodes[w] = wCode
			sort.Sort(teams.ByWorkcode(team.Workcodes))
		}
	}

	if err = services.UpdateTeam(team); err != nil {
		services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s UpdateTeam: %s", logmsg, err.Error()))
		c.JSON(http.StatusBadRequest, web.SiteResponse{Team: nil, Site: nil,
			Exception: err.Error()})
		return
	}

	c.JSON(http.StatusOK, web.SiteResponse{Team: team, Site: nil, Exception: ""})
}

func DeleteTeamWorkcode(c *gin.Context) {
	teamID := c.Param("teamid")
	wcID := c.Param("wcid")
	logmsg := "TeamController: DeleteTeamWorkcode:"

	team, err := services.GetTeam(teamID)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s GetTeam: %s", logmsg, "Team Not Found"))
			c.JSON(http.StatusNotFound, web.SiteResponse{Team: nil, Site: nil,
				Exception: "Team Not Found"})
		} else {
			services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s GetTeam Error: %s", logmsg, err.Error()))
			c.JSON(http.StatusBadRequest, web.SiteResponse{Team: nil, Site: nil,
				Exception: err.Error()})
		}
		return
	}

	pos := -1
	for w, wCode := range team.Workcodes {
		if strings.EqualFold(wCode.Id, wcID) {
			pos = w
		}
	}

	if pos >= 0 {
		team.Workcodes = append(team.Workcodes[:pos], team.Workcodes[pos+1:]...)
	}

	if err = services.UpdateTeam(team); err != nil {
		services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s UpdateTeam: %s", logmsg, err.Error()))
		c.JSON(http.StatusBadRequest, web.SiteResponse{Team: nil, Site: nil,
			Exception: err.Error()})
		return
	}

	c.JSON(http.StatusOK, web.SiteResponse{Team: team, Site: nil, Exception: ""})
}

func CreateTeamCompany(c *gin.Context) {
	var data web.CreateTeamCompany
	logmsg := "TeamController: CreateTeamCompany:"

	if err := c.ShouldBindJSON(&data); err != nil {
		services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s DataBinding: %s", logmsg, err.Error()))
		c.JSON(http.StatusBadRequest,
			web.SiteResponse{Team: nil, Site: nil, Exception: "Trouble with request"})
		return
	}

	team, err := services.GetTeam(data.TeamID)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s GetTeam: %s", logmsg, "Team Not Found"))
			c.JSON(http.StatusNotFound, web.SiteResponse{Team: nil, Site: nil,
				Exception: "Team Not Found"})
		} else {
			services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s GetTeam Error: %s", logmsg, err.Error()))
			c.JSON(http.StatusBadRequest, web.SiteResponse{Team: nil, Site: nil,
				Exception: err.Error()})
		}
		return
	}

	found := false
	for c, company := range team.Companies {
		if strings.EqualFold(company.ID, data.ID) {
			found = true
			company.Name = data.Name
			company.IngestType = data.IngestType
			team.Companies[c] = company
		}
	}
	if !found {
		company := teams.Company{
			ID:         data.ID,
			Name:       data.Name,
			IngestType: data.IngestType,
		}
		team.Companies = append(team.Companies, company)
		sort.Sort(teams.ByCompany(team.Companies))
	}

	if err = services.UpdateTeam(team); err != nil {
		services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s UpdateTeam: %s", logmsg, err.Error()))
		c.JSON(http.StatusBadRequest, web.SiteResponse{Team: nil, Site: nil,
			Exception: err.Error()})
		return
	}

	c.JSON(http.StatusOK, web.SiteResponse{Team: team, Site: nil, Exception: ""})
}

func UpdateTeamCompany(c *gin.Context) {
	var data web.UpdateTeamRequest
	logmsg := "TeamController: UpdateTeamCompany:"

	if err := c.ShouldBindJSON(&data); err != nil {
		services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s DataBinding: %s", logmsg, err.Error()))
		c.JSON(http.StatusBadRequest,
			web.SiteResponse{Team: nil, Site: nil, Exception: "Trouble with request"})
		return
	}

	team, err := services.GetTeam(data.TeamID)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s GetTeam: %s", logmsg, "Team Not Found"))
			c.JSON(http.StatusNotFound, web.SiteResponse{Team: nil, Site: nil,
				Exception: "Team Not Found"})
		} else {
			services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s GetTeam: %s", logmsg, err.Error()))
			c.JSON(http.StatusBadRequest, web.SiteResponse{Team: nil, Site: nil,
				Exception: err.Error()})
		}
		return
	}

	for co, company := range team.Companies {
		if strings.EqualFold(company.ID, data.AdditionalID) {
			switch strings.ToLower(data.Field) {
			case "name":
				company.Name = data.Value
			case "ingest", "ingesttype":
				company.IngestType = data.Value
			case "ingestpwd":
				company.IngestPwd = data.Value
			case "ingestperiod", "period":
				iVal, err := strconv.Atoi(data.Value)
				if err == nil {
					company.IngestPeriod = iVal
				}
			case "ingeststartday", "startday", "start":
				iVal, err := strconv.Atoi(data.Value)
				if err == nil {
					company.IngestStartDay = iVal
				}
			case "addmod", "addmodperiod":
				parts := strings.Split(data.Value, "|")
				if len(parts) < 3 {
					services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
						fmt.Sprintf("%s Not enough info (Add Mod): data split too short",
							logmsg))
					c.JSON(http.StatusBadRequest,
						web.SiteResponse{Team: nil, Site: nil,
							Exception: "Not enough info (Add Mod): data split too short"})
					return
				}
				year, err := strconv.Atoi(parts[0])
				if err != nil {
					services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
						fmt.Sprintf("%s Converting Add Mod Year: %s", logmsg, err.Error()))
					c.JSON(http.StatusBadRequest,
						web.SiteResponse{Team: nil, Site: nil,
							Exception: "Error with Company Add Mod Period Year: " +
								err.Error()})
					return
				}
				start, err := time.ParseInLocation("2006-01-02", parts[1], time.UTC)
				if err != nil {
					services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
						fmt.Sprintf("%s Converting Add Mod Start: %s", logmsg, err.Error()))
					c.JSON(http.StatusBadRequest,
						web.SiteResponse{Team: nil, Site: nil,
							Exception: "Error with Company Add Mod Period Start: " +
								err.Error()})
					return
				}
				end, err := time.ParseInLocation("2006-01-02", parts[2], time.UTC)
				if err != nil {
					services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
						fmt.Sprintf("%s Converting Add Mod End: %s", logmsg, err.Error()))
					c.JSON(http.StatusBadRequest,
						web.SiteResponse{Team: nil, Site: nil,
							Exception: "Error with Company Add Mod Period End: " +
								err.Error()})
					return
				}
				company.AddModPeriod(year, start, end)
			case "updatemod", "updatemodperiod":
				parts := strings.Split(data.Value, "|")
				if len(parts) > 2 {
					iYear, err := strconv.Atoi(parts[1])
					if err != nil {
						services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
							fmt.Sprintf("%s Converting Mod Year Key: %s", logmsg, err.Error()))
						c.JSON(http.StatusBadRequest,
							web.SiteResponse{Team: nil, Site: nil,
								Exception: "Error with converting mod year key: " +
									err.Error()})
						return
					}
					oDate, err := time.ParseInLocation("2006-01-02", parts[2], time.UTC)
					if err != nil {
						services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
							fmt.Sprintf("%s Converting Mod Year Date: %s", logmsg, err.Error()))
						c.JSON(http.StatusBadRequest,
							web.SiteResponse{Team: nil, Site: nil,
								Exception: "Error with converting mod year date: " +
									err.Error()})
						return
					}
					company.UpdateModPeriod(iYear, parts[0], oDate)
				}
			case "delmod", "delmodperiod", "deletemodperiod":
				year, err := strconv.Atoi(data.Value)
				if err != nil {
					services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
						fmt.Sprintf("%s Converting Add Mod Year: %s", logmsg, err.Error()))
					c.JSON(http.StatusBadRequest,
						web.SiteResponse{Team: nil, Site: nil,
							Exception: "Error with Company Add Mod Period Year: " +
								err.Error()})
					return
				}
				company.DeleteModPeriod(year)
			}
			team.Companies[co] = company
		}
	}

	if err = services.UpdateTeam(team); err != nil {
		services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s UpdateTeam: %s", logmsg, err.Error()))
		c.JSON(http.StatusBadRequest, web.SiteResponse{Team: nil, Site: nil,
			Exception: err.Error()})
		return
	}

	c.JSON(http.StatusOK, web.SiteResponse{Team: team, Site: nil, Exception: ""})
}

func DeleteTeamCompany(c *gin.Context) {
	teamID := c.Param("teamid")
	companyID := c.Param("companyid")
	logmsg := "TeamController: DeleteTeamCompany:"

	team, err := services.GetTeam(teamID)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s GetTeam: %s", logmsg, "Team Not Found"))
			c.JSON(http.StatusNotFound, web.SiteResponse{Team: nil, Site: nil,
				Exception: "Team Not Found"})
		} else {
			services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s GetTeam: %s", logmsg, err.Error()))
			c.JSON(http.StatusBadRequest, web.SiteResponse{Team: nil, Site: nil,
				Exception: err.Error()})
		}
		return
	}

	pos := -1
	for c, company := range team.Companies {
		if strings.EqualFold(company.ID, companyID) {
			pos = c
		}
	}

	if pos >= 0 {
		team.Companies = append(team.Companies[:pos], team.Companies[pos+1:]...)
	}

	if err = services.UpdateTeam(team); err != nil {
		services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s UpdateTeam: %s", logmsg, err.Error()))
		c.JSON(http.StatusBadRequest, web.SiteResponse{Team: nil, Site: nil,
			Exception: err.Error()})
		return
	}

	c.JSON(http.StatusOK, web.SiteResponse{Team: team, Site: nil, Exception: ""})
}

func CreateCompanyHoliday(c *gin.Context) {
	var data web.CreateCompanyHoliday
	logmsg := "TeamController: CreateCompanyHoliday:"

	if err := c.ShouldBindJSON(&data); err != nil {
		services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s DataBinding: %s", logmsg, err.Error()))
		c.JSON(http.StatusBadRequest,
			web.SiteResponse{Team: nil, Site: nil, Exception: "Trouble with request"})
		return
	}

	team, err := services.GetTeam(data.TeamID)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s GetTeam: %s", logmsg, "Team Not Found"))
			c.JSON(http.StatusNotFound, web.SiteResponse{Team: nil, Site: nil,
				Exception: "Team Not Found"})
		} else {
			services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s GetTeam: %s", logmsg, err.Error()))
			c.JSON(http.StatusBadRequest, web.SiteResponse{Team: nil, Site: nil,
				Exception: err.Error()})
		}
		return
	}

	found := false
	maxID := -1
	for c, company := range team.Companies {
		if strings.EqualFold(company.ID, data.CompanyID) {
			for h, holiday := range company.Holidays {
				if strings.EqualFold(holiday.Name, data.Name) {
					found = true
					holiday.Name = data.Name
					if data.Actual != "" {
						newDate, _ := time.Parse("2006-01-02", data.Actual)
						dateFound := false
						for _, dt := range holiday.ActualDates {
							if dt.Equal(newDate) {
								dateFound = true
							}
						}
						if !dateFound {
							holiday.ActualDates = append(holiday.ActualDates, newDate)
						}
					}
					company.Holidays[h] = holiday
				}
				if strings.EqualFold(holiday.ID, data.HolidayID) &&
					maxID < int(holiday.SortID) {
					maxID = int(holiday.SortID)
				}
			}
			if !found {
				holiday := teams.CompanyHoliday{
					ID:     data.HolidayID,
					Name:   data.Name,
					SortID: uint(maxID + 1),
				}
				if data.Actual != "" {
					newDate, _ := time.Parse("2006-01-02", data.Actual)
					holiday.ActualDates = append(holiday.ActualDates, newDate)
				}
				company.Holidays = append(company.Holidays, holiday)
			}
			sort.Sort(teams.ByCompanyHoliday(company.Holidays))
			team.Companies[c] = company
		}
	}

	if err = services.UpdateTeam(team); err != nil {
		services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s UpdateTeam: %s", logmsg, err.Error()))
		c.JSON(http.StatusBadRequest, web.SiteResponse{Team: nil, Site: nil,
			Exception: err.Error()})
		return
	}

	c.JSON(http.StatusOK, web.SiteResponse{Team: team, Site: nil, Exception: ""})
}

func UpdateCompanyHoliday(c *gin.Context) {
	var data web.UpdateTeamRequest
	logmsg := "TeamController: UpdateCompanyHoliday:"

	if err := c.ShouldBindJSON(&data); err != nil {
		services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s DataBinding: %s", logmsg, err.Error()))
		c.JSON(http.StatusBadRequest,
			web.SiteResponse{Team: nil, Site: nil, Exception: "Trouble with request"})
		return
	}

	team, err := services.GetTeam(data.TeamID)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s GetTeam: %s", logmsg, "Team Not Found"))
			c.JSON(http.StatusNotFound, web.SiteResponse{Team: nil, Site: nil,
				Exception: "Team Not Found"})
		} else {
			services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s GetTeam Error: %s", logmsg, err.Error()))
			c.JSON(http.StatusBadRequest, web.SiteResponse{Team: nil, Site: nil,
				Exception: err.Error()})
		}
		return
	}

	holID := data.HolidayID[0:1]
	holSortID, err := strconv.Atoi(data.HolidayID[1:])
	if err != nil {
		services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s Conversion Holiday Sort: %s", logmsg, err.Error()))
		c.JSON(http.StatusBadRequest, web.SiteResponse{Team: nil, Site: nil,
			Exception: err.Error()})
		return
	}
	for c, company := range team.Companies {
		if strings.EqualFold(company.ID, data.AdditionalID) {
			sort.Sort(teams.ByCompanyHoliday(company.Holidays))
			found := false
			for h := 0; h < len(company.Holidays) && !found; h++ {
				holiday := company.Holidays[h]
				if holiday.ID == holID && holiday.SortID == uint(holSortID) {
					found = true
					switch strings.ToLower(data.Field) {
					case "name":
						holiday.Name = data.Value
					case "move":
						tSort := holiday.SortID
						if strings.ToLower(data.Value[:1]) == "u" {
							if h > 0 {
								holiday2 := company.Holidays[h-1]
								if holiday2.ID == holID {
									holiday.SortID = holiday2.SortID
									holiday2.SortID = tSort
									company.Holidays[h-1] = holiday2
								}
							}
						} else if strings.ToLower(data.Value[:1]) == "d" {
							if h < len(company.Holidays)-1 {
								holiday2 := company.Holidays[h+1]
								if holiday2.ID == holID {
									holiday.SortID = holiday2.SortID
									holiday2.SortID = tSort
									company.Holidays[h+1] = holiday2
								}
							}
						}
					case "addactual", "addactualdate", "actual":
						tDate, _ := time.Parse("2006-01-02", data.Value)
						found := false
						for d, aDate := range holiday.ActualDates {
							if aDate.Year() == tDate.Year() {
								found = true
								holiday.ActualDates[d] = tDate
							}
						}
						if !found {
							holiday.ActualDates = append(holiday.ActualDates, tDate)
						}
					case "replaceactual", "replaceactualdate", "replacedate":
						parts := strings.Split(data.Value, "|")
						if len(parts) > 1 {
							oldDate, _ := time.Parse("2006-01-02", parts[0])
							newDate, _ := time.Parse("2006-01-02", parts[1])
							for d := 0; d < len(holiday.ActualDates); d++ {
								if holiday.ActualDates[d].Equal(oldDate) {
									holiday.ActualDates[d] = newDate
								}
							}
						}
					case "removeactual", "removeactualdate":
						tDate, _ := time.Parse("2006-01-02", data.Value)
						pos := -1
						for d, aDate := range holiday.ActualDates {
							if aDate.Equal(tDate) {
								pos = d
							}
						}
						if pos >= 0 {
							holiday.ActualDates = append(holiday.ActualDates[:pos],
								holiday.ActualDates[pos+1:]...)
						}
					}
					company.Holidays[h] = holiday
				}
			}
			sort.Sort(teams.ByCompanyHoliday(company.Holidays))
			team.Companies[c] = company
		}
	}

	if err = services.UpdateTeam(team); err != nil {
		services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s UpdateTeam: %s", logmsg, err.Error()))
		c.JSON(http.StatusBadRequest, web.SiteResponse{Team: nil, Site: nil,
			Exception: err.Error()})
		return
	}

	c.JSON(http.StatusOK, web.SiteResponse{Team: team, Site: nil, Exception: ""})
}

func DeleteCompanyHoliday(c *gin.Context) {
	teamID := c.Param("teamid")
	companyID := c.Param("companyid")
	holidayID := c.Param("holidayid")
	logmsg := "TeamController: DeleteCompanyHoliday:"

	holID := holidayID[0:1]
	holSortID, err := strconv.Atoi(holidayID[1:])
	if err != nil {
		services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s Holday ID Convertion: %s", logmsg, err.Error()))
		c.JSON(http.StatusBadRequest, web.SiteResponse{Team: nil, Site: nil,
			Exception: err.Error()})
		return
	}

	team, err := services.GetTeam(teamID)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s GetTeam: %s", logmsg, "Team Not Found"))
			c.JSON(http.StatusNotFound, web.SiteResponse{Team: nil, Site: nil,
				Exception: "Team Not Found"})
		} else {
			services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s GetTeam: %s", logmsg, err.Error()))
			c.JSON(http.StatusBadRequest, web.SiteResponse{Team: nil, Site: nil,
				Exception: err.Error()})
		}
		return
	}

	pos := -1
	for c, company := range team.Companies {
		if strings.EqualFold(company.ID, companyID) {
			for h, holiday := range company.Holidays {
				if strings.EqualFold(holiday.ID, holID) &&
					holiday.SortID == uint(holSortID) {
					pos = h
				}
			}
			if pos >= 0 {
				company.Holidays = append(company.Holidays[:pos],
					company.Holidays[pos+1:]...)
			}
			sort.Sort(teams.ByCompanyHoliday(company.Holidays))
			holID = ""
			sortID := 0
			for h, hol := range company.Holidays {
				if hol.ID != holID {
					holID = hol.ID
					sortID = 0
				}
				sortID++
				hol.SortID = uint(sortID)
				company.Holidays[h] = hol
			}
			team.Companies[c] = company
		}
	}

	if err = services.UpdateTeam(team); err != nil {
		services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s UpdateTeam: %s", logmsg, err.Error()))
		c.JSON(http.StatusBadRequest, web.SiteResponse{Team: nil, Site: nil,
			Exception: err.Error()})
		return
	}

	c.JSON(http.StatusOK, web.SiteResponse{Team: team, Site: nil, Exception: ""})
}

func CreateContactType(c *gin.Context) {
	var data web.AddType
	logmsg := "TeamController: CreateTeamContactType:"

	if err := c.ShouldBindJSON(&data); err != nil {
		services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s DataBinding: %s", logmsg, err.Error()))
		c.JSON(http.StatusBadRequest,
			web.SiteResponse{Team: nil, Site: nil, Exception: "Trouble with request"})
		return
	}

	team, err := services.GetTeam(data.TeamID)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s GetTeam: %s", logmsg, "Team Not Found"))
			c.JSON(http.StatusNotFound, web.SiteResponse{Team: nil, Site: nil,
				Exception: "Team Not Found"})
		} else {
			services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s GetTeam Error: %s", logmsg, err.Error()))
			c.JSON(http.StatusBadRequest, web.SiteResponse{Team: nil, Site: nil,
				Exception: err.Error()})
		}
		return
	}

	team.AddContactType(data.ID, data.Name)

	if err = services.UpdateTeam(team); err != nil {
		services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s UpdateTeam: %s", logmsg, err.Error()))
		c.JSON(http.StatusBadRequest, web.SiteResponse{Team: nil, Site: nil,
			Exception: err.Error()})
		return
	}

	c.JSON(http.StatusOK, web.SiteResponse{Team: team, Site: nil, Exception: ""})
}

func ChangeContactType(c *gin.Context) {
	var data web.UpdateType
	logmsg := "TeamController: ChangeContactType:"

	if err := c.ShouldBindJSON(&data); err != nil {
		services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s DataBinding: %s", logmsg, err.Error()))
		c.JSON(http.StatusBadRequest,
			web.SiteResponse{Team: nil, Site: nil, Exception: "Trouble with request"})
		return
	}

	team, err := services.GetTeam(data.TeamID)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s GetTeam: %s", logmsg, "Team Not Found"))
			c.JSON(http.StatusNotFound, web.SiteResponse{Team: nil, Site: nil,
				Exception: "Team Not Found"})
		} else {
			services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s GetTeam Error: %s", logmsg, err.Error()))
			c.JSON(http.StatusBadRequest, web.SiteResponse{Team: nil, Site: nil,
				Exception: err.Error()})
		}
		return
	}

	if strings.EqualFold(data.Field, "sort") {
		team.UpdateContactTypeSort(data.ID, data.Value)
		contactMap := make(map[int]int)
		for _, ct := range team.ContactTypes {
			contactMap[ct.Id] = ct.SortID
		}
		emps, err := services.GetEmployeesForTeam(team.ID.Hex())
		if err != nil {
			services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s GetEmployeesForTeam: %s", logmsg, err.Error()))
			c.JSON(http.StatusBadRequest, web.SiteResponse{Team: nil, Site: nil,
				Exception: err.Error()})
			return
		}
		for _, emp := range emps {
			emp.ResortContactInfo(contactMap)
			services.UpdateEmployee(&emp)
		}
	} else if strings.EqualFold(data.Field, "title") {
		for c, ct := range team.ContactTypes {
			if ct.Id == data.ID {
				ct.Name = data.Value
				team.ContactTypes[c] = ct
			}
		}
	} else {
		team.AddContactType(data.ID, data.Value)
	}

	if err = services.UpdateTeam(team); err != nil {
		services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s UpdateTeam: %s", logmsg, err.Error()))
		c.JSON(http.StatusBadRequest, web.SiteResponse{Team: nil, Site: nil,
			Exception: err.Error()})
		return
	}

	c.JSON(http.StatusOK, web.SiteResponse{Team: team, Site: nil, Exception: ""})
}

func DeleteContactType(c *gin.Context) {
	teamid := c.Param("teamid")
	ctID := c.Param("id")
	logmsg := "TeamController: DeleteContactType:"

	id, err := strconv.Atoi(ctID)
	if err != nil {
		services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s Contact Type ID Convertion: %s", logmsg, err.Error()))
		c.JSON(http.StatusBadRequest, web.SiteResponse{Team: nil, Site: nil,
			Exception: err.Error()})
		return
	}

	team, err := services.GetTeam(teamid)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s GetTeam: %s", logmsg, "Team Not Found"))
			c.JSON(http.StatusNotFound, web.SiteResponse{Team: nil, Site: nil,
				Exception: "Team Not Found"})
		} else {
			services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s GetTeam Error: %s", logmsg, err.Error()))
			c.JSON(http.StatusBadRequest, web.SiteResponse{Team: nil, Site: nil,
				Exception: err.Error()})
		}
		return
	}

	team.DeleteContactType(id)

	if err = services.UpdateTeam(team); err != nil {
		services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s UpdateTeam: %s", logmsg, err.Error()))
		c.JSON(http.StatusBadRequest, web.SiteResponse{Team: nil, Site: nil,
			Exception: err.Error()})
		return
	}

	// delete contact info in all employees within the team
	emps, err := services.GetEmployeesForTeam(team.ID.Hex())
	if err != nil {
		services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s GetEmployeesForTeam: %s", logmsg, err.Error()))
		c.JSON(http.StatusBadRequest, web.SiteResponse{Team: nil, Site: nil,
			Exception: err.Error()})
		return
	}
	for _, emp := range emps {
		emp.DeleteContactInfoByType(id)
		services.UpdateEmployee(&emp)
	}

	c.JSON(http.StatusOK, web.SiteResponse{Team: team, Site: nil, Exception: ""})
}

func CreateSpecialtyType(c *gin.Context) {
	var data web.AddType
	logmsg := "TeamController: CreateTeamContactType:"

	if err := c.ShouldBindJSON(&data); err != nil {
		services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s DataBinding: %s", logmsg, err.Error()))
		c.JSON(http.StatusBadRequest,
			web.SiteResponse{Team: nil, Site: nil, Exception: "Trouble with request"})
		return
	}

	team, err := services.GetTeam(data.TeamID)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s GetTeam: %s", logmsg, "Team Not Found"))
			c.JSON(http.StatusNotFound, web.SiteResponse{Team: nil, Site: nil,
				Exception: "Team Not Found"})
		} else {
			services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s GetTeam Error: %s", logmsg, err.Error()))
			c.JSON(http.StatusBadRequest, web.SiteResponse{Team: nil, Site: nil,
				Exception: err.Error()})
		}
		return
	}

	team.AddSpecialtyType(data.ID, data.Name)

	if err = services.UpdateTeam(team); err != nil {
		services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s UpdateTeam: %s", logmsg, err.Error()))
		c.JSON(http.StatusBadRequest, web.SiteResponse{Team: nil, Site: nil,
			Exception: err.Error()})
		return
	}

	c.JSON(http.StatusOK, web.SiteResponse{Team: team, Site: nil, Exception: ""})
}

func ChangeSpecialtyType(c *gin.Context) {
	var data web.UpdateType
	logmsg := "TeamController: ChangeContactType:"

	if err := c.ShouldBindJSON(&data); err != nil {
		services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s DataBinding: %s", logmsg, err.Error()))
		c.JSON(http.StatusBadRequest,
			web.SiteResponse{Team: nil, Site: nil, Exception: "Trouble with request"})
		return
	}

	team, err := services.GetTeam(data.TeamID)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s GetTeam: %s", logmsg, "Team Not Found"))
			c.JSON(http.StatusNotFound, web.SiteResponse{Team: nil, Site: nil,
				Exception: "Team Not Found"})
		} else {
			services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s GetTeam Error: %s", logmsg, err.Error()))
			c.JSON(http.StatusBadRequest, web.SiteResponse{Team: nil, Site: nil,
				Exception: err.Error()})
		}
		return
	}

	if strings.ToLower(data.Field) == "sort" {
		team.UpdateSpecialtyTypeSort(data.ID, data.Value)
		contactMap := make(map[int]int)
		for _, ct := range team.SpecialtyTypes {
			contactMap[ct.Id] = ct.SortID
		}
		emps, err := services.GetEmployeesForTeam(team.ID.Hex())
		if err != nil {
			services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s GetEmployeesForTeam: %s", logmsg, err.Error()))
			c.JSON(http.StatusBadRequest, web.SiteResponse{Team: nil, Site: nil,
				Exception: err.Error()})
			return
		}
		for _, emp := range emps {
			emp.ResortSpecialties(contactMap)
			services.UpdateEmployee(&emp)
		}
	} else {
		team.AddSpecialtyType(data.ID, data.Value)
	}

	if err = services.UpdateTeam(team); err != nil {
		services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s UpdateTeam: %s", logmsg, err.Error()))
		c.JSON(http.StatusBadRequest, web.SiteResponse{Team: nil, Site: nil,
			Exception: err.Error()})
		return
	}

	c.JSON(http.StatusOK, web.SiteResponse{Team: team, Site: nil, Exception: ""})
}

func DeleteSpecialtyType(c *gin.Context) {
	teamid := c.Param("teamid")
	ctID := c.Param("id")
	logmsg := "TeamController: DeleteContactType:"

	id, err := strconv.Atoi(ctID)
	if err != nil {
		services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s Contact Type ID Convertion: %s", logmsg, err.Error()))
		c.JSON(http.StatusBadRequest, web.SiteResponse{Team: nil, Site: nil,
			Exception: err.Error()})
		return
	}

	team, err := services.GetTeam(teamid)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s GetTeam: %s", logmsg, "Team Not Found"))
			c.JSON(http.StatusNotFound, web.SiteResponse{Team: nil, Site: nil,
				Exception: "Team Not Found"})
		} else {
			services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s GetTeam Error: %s", logmsg, err.Error()))
			c.JSON(http.StatusBadRequest, web.SiteResponse{Team: nil, Site: nil,
				Exception: err.Error()})
		}
		return
	}

	team.DeleteSpecialtyType(id)

	if err = services.UpdateTeam(team); err != nil {
		services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s UpdateTeam: %s", logmsg, err.Error()))
		c.JSON(http.StatusBadRequest, web.SiteResponse{Team: nil, Site: nil,
			Exception: err.Error()})
		return
	}

	// delete specialty type in all employees within the team
	emps, err := services.GetEmployeesForTeam(team.ID.Hex())
	if err != nil {
		services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s GetEmployeesForTeam: %s", logmsg, err.Error()))
		c.JSON(http.StatusBadRequest, web.SiteResponse{Team: nil, Site: nil,
			Exception: err.Error()})
		return
	}
	for _, emp := range emps {
		emp.DeleteSpecialtyByType(id)
		services.UpdateEmployee(&emp)
	}

	c.JSON(http.StatusOK, web.SiteResponse{Team: team, Site: nil, Exception: ""})
}
