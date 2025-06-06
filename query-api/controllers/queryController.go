package controllers

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/erneap/models/v2/employees"
	"github.com/erneap/models/v2/svcs"
	"github.com/erneap/scheduler2/queryApi/models/web"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func BasicQuery(c *gin.Context) {
	// the basic query is for who is working now
	now := time.Now().UTC()
	logmsg := "QueryController: BasicQuery:"

	teamid := c.Param("teamid")

	emps, err := svcs.GetEmployeesForTeam(teamid)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			svcs.CreateDBLogEntry("QueryAPI", "Error", "Employee Not Found", "",
				fmt.Sprintf("%s getEmployeesForTeam Problem: Employee Not Found", logmsg), c)
			c.JSON(http.StatusNotFound, web.IngestResponse{Employees: nil,
				Exception: "Employee Not Found"})
		} else {
			svcs.CreateDBLogEntry("QueryAPI", "Error", "GetEmployees Problem", "",
				fmt.Sprintf("%s getEmployeesForTeam Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusBadRequest, web.IngestResponse{Employees: nil,
				Exception: err.Error()})
		}
		return
	}

	team, err := svcs.GetTeam(teamid)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			svcs.CreateDBLogEntry("QueryAPI", "Error", "PROBLEM", "",
				fmt.Sprintf("%s getTeam Problem: Team Not Found", logmsg), c)
			c.JSON(http.StatusNotFound, web.IngestResponse{Employees: nil,
				Exception: "Team Not Found"})
		} else {
			svcs.CreateDBLogEntry("QueryAPI", "Error", "PROBLEM", "",
				fmt.Sprintf("%s getTeam Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusBadRequest, web.IngestResponse{Employees: nil,
				Exception: err.Error()})
		}
		return
	}

	answer := &web.IngestResponse{}
	answer.Employees = make([]employees.Employee, 0)
	for _, emp := range emps {
		// find the site information for the employee and the time at site to
		// determine the date at the site.
		var dateAtSite time.Time
		localHour := 0
		for _, site := range team.Sites {
			if site.ID == emp.SiteID {
				ds := now.Add(time.Hour * time.Duration(site.UtcOffset))
				localHour = ds.Hour()
				dateAtSite = time.Date(ds.Year(), ds.Month(),
					ds.Day(), 0, 0, 0, 0, time.UTC)
			}
		}
		wd := emp.GetWorkday(dateAtSite, now.AddDate(0, 0, -1))
		if wd != nil {
			for _, wc := range team.Workcodes {
				if !wc.IsLeave && strings.EqualFold(wc.Id, wd.Code) {
					start := int(wc.StartTime)
					end := start + int(wd.Hours)
					if end > start {
						if localHour >= start && localHour <= end {
							answer.Employees = append(answer.Employees, emp)
						}
					} else {
						if (localHour >= 0 && localHour <= end) ||
							(localHour >= start && localHour < 24) {
							answer.Employees = append(answer.Employees, emp)
						}
					}
				}
			}
		}
	}
	fmt.Printf("Answer: %d\n", len(answer.Employees))
	c.JSON(http.StatusOK, answer)
}

func ComplexQuery(c *gin.Context) {
	now := time.Now().UTC()
	var data web.QueryRequest
	logmsg := "QueryController: ComplexQuery:"
	if err := c.ShouldBindJSON(&data); err != nil {
		svcs.CreateDBLogEntry("QueryAPI", "Error", "Binding Problem", "",
			fmt.Sprintf("%s Request Data Binding, Trouble with request", logmsg), c)
		c.JSON(http.StatusBadRequest,
			web.EmployeeResponse{Employee: nil, Exception: "Trouble with request"})
		return
	}

	emps, err := svcs.GetEmployeesForTeam(data.TeamID)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			svcs.CreateDBLogEntry("QueryAPI", "Error", "Employee Not Found", "",
				fmt.Sprintf("%s getEmployeesForTeam Problem: Employee Not Found", logmsg), c)
			c.JSON(http.StatusNotFound, web.IngestResponse{Employees: nil,
				Exception: "Employee Not Found"})
		} else {
			svcs.CreateDBLogEntry("QueryAPI", "Error", "GetEmployees Problem", "",
				fmt.Sprintf("%s getEmployeesForTeam Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusBadRequest, web.IngestResponse{Employees: nil,
				Exception: err.Error()})
		}
		return
	}

	team, err := svcs.GetTeam(data.TeamID)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			svcs.CreateDBLogEntry("QueryAPI", "Error", "Get Team Problem", "",
				fmt.Sprintf("%s getTeam Problem: Team Not Found", logmsg), c)
			c.JSON(http.StatusNotFound, web.IngestResponse{Employees: nil,
				Exception: "Team Not Found"})
		} else {
			svcs.CreateDBLogEntry("QueryAPI", "Error", "GetTeam Problem", "",
				fmt.Sprintf("%s getTeam Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusBadRequest, web.IngestResponse{Employees: nil,
				Exception: err.Error()})
		}
		return
	}

	answer := &web.IngestResponse{}
	for _, emp := range emps {
		// find the site information for the employee and the time at site to
		// determine the date at the site.
		var dateAtSite time.Time
		localHour := 0
		for _, site := range team.Sites {
			if site.ID == emp.SiteID {
				ds := now.Add(time.Hour * time.Duration(site.UtcOffset))
				localHour = ds.Hour()
				dateAtSite = time.Date(ds.Year(), ds.Month(),
					ds.Day(), 0, 0, 0, 0, time.UTC)
			}
		}
		wd := emp.GetWorkday(dateAtSite, now.AddDate(0, 0, -1))
		if wd != nil {
			for _, wc := range team.Workcodes {
				if !wc.IsLeave && strings.EqualFold(wc.Id, wd.Code) {
					start := int(wc.StartTime)
					end := start + int(wd.Hours)
					for hr := 0; hr <= data.NextHours; hr++ {
						if end > start {
							if (localHour+hr) >= start && (localHour+hr) <= end {
								// look for specialties
								if len(data.Specialties) == 0 {
									found := false
									for _, e := range answer.Employees {
										if emp.ID == e.ID {
											found = true
										}
									}
									if !found {
										answer.Employees = append(answer.Employees, emp)
									}
								} else {
									found := false
									for _, sp := range data.Specialties {
										if emp.HasSpecialty(sp) {
											if !found {
												eFound := false
												for _, e := range answer.Employees {
													if e.ID == emp.ID {
														eFound = true
													}
												}
												if !eFound {
													answer.Employees = append(answer.Employees, emp)
												}
												found = true
											}
										}
									}
								}
							}
						} else {
							if (localHour >= 0 && localHour <= end) ||
								(localHour >= start && localHour < 24) {
								if len(data.Specialties) == 0 {
									found := false
									for _, e := range answer.Employees {
										if emp.ID == e.ID {
											found = true
										}
									}
									if !found {
										answer.Employees = append(answer.Employees, emp)
									}
								} else {
									found := false
									for _, sp := range data.Specialties {
										if emp.HasSpecialty(sp) {
											if !found {
												eFound := false
												for _, e := range answer.Employees {
													if e.ID == emp.ID {
														eFound = true
													}
												}
												if !eFound {
													answer.Employees = append(answer.Employees, emp)
												}
												found = true
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
	c.JSON(http.StatusOK, answer)
}
