package controllers

import (
	"fmt"
	"net/http"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/erneap/go-models/converters"
	"github.com/erneap/go-models/employees"
	"github.com/erneap/go-models/notifications"
	"github.com/erneap/go-models/sites"
	"github.com/erneap/scheduler2/schedulerApi/models/ingest"
	"github.com/erneap/scheduler2/schedulerApi/models/web"
	"github.com/erneap/scheduler2/schedulerApi/services"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func GetIngestEmployees(c *gin.Context) {
	logmsg := "IngestController: GetIngestEmployees:"
	teamid := c.Param("teamid")
	siteid := c.Param("siteid")
	companyid := c.Param("company")
	uyear, err := strconv.ParseUint(c.Param("year"), 10, 32)
	if err != nil {
		uyear = uint64(time.Now().Year())
	}
	year := uint(uyear)

	companyEmployees, err := getEmployeesAfterIngest(teamid, siteid, companyid,
		year, year)
	if err != nil {
		services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s GetEmployeesAfterIngest: %s", logmsg, err.Error()))
		c.JSON(http.StatusBadRequest, web.IngestResponse{Exception: err.Error()})
	}

	team, err := services.GetTeam(teamid)
	if err != nil {
		services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s GetTeam: %s", logmsg, err.Error()))
		c.JSON(http.StatusBadRequest, web.IngestResponse{Exception: err.Error()})
		return
	}

	ingestType := ""
	for _, co := range team.Companies {
		if co.ID == companyid {
			ingestType = co.IngestType
		}
	}

	c.JSON(http.StatusOK, web.IngestResponse{
		Employees:  companyEmployees,
		IngestType: ingestType,
		Exception:  "",
	})
}

func getEmployeesAfterIngest(team, site, company string, startyear uint,
	endyear uint) ([]employees.Employee, error) {
	var companyEmployees []employees.Employee

	empls, err := services.GetEmployees(team, site)
	if err != nil {
		return companyEmployees, err
	}

	for _, emp := range empls {
		if emp.CompanyInfo.Company == company {
			emp.Work = emp.Work[:0]
			// get work for current and previous years
			work, err := services.GetEmployeeWork(emp.ID.Hex(), startyear)
			if err == nil && len(work.Work) > 0 {
				emp.Work = append(emp.Work, work.Work...)
			}
			if endyear != startyear {
				work, err := services.GetEmployeeWork(emp.ID.Hex(), endyear)
				if err == nil && len(work.Work) > 0 {
					emp.Work = append(emp.Work, work.Work...)
				}
			}
			sort.Sort(employees.ByEmployeeWork(emp.Work))
			companyEmployees = append(companyEmployees, emp)
		}
	}
	sort.Sort(employees.ByEmployees(companyEmployees))

	return companyEmployees, nil
}

func IngestFiles(c *gin.Context) {
	form, _ := c.MultipartForm()
	teamid := form.Value["team"][0]
	siteid := form.Value["site"][0]
	companyid := form.Value["company"][0]
	logmsg := "IngestController: IngestFiles:"

	team, err := services.GetTeam(teamid)
	if err != nil {
		services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s GetTeam: %s", logmsg, err.Error()))
		c.JSON(http.StatusBadRequest, web.IngestResponse{Exception: "Team not found"})
		return
	}

	ingestType := "manual"
	startDay := 0
	period := 7
	startWeekday := time.Sunday
	var records []ingest.ExcelRow
	start := time.Now()
	end := time.Date(1970, 1, 1, 0, 0, 0, 0, time.UTC)

	for _, co := range team.Companies {
		if co.ID == companyid {
			ingestType = co.IngestType
			startDay = co.IngestStartDay
			period = co.IngestPeriod
			switch startDay {
			case 0:
				startWeekday = time.Sunday
			case 1:
				startWeekday = time.Monday
			case 2:
				startWeekday = time.Tuesday
			case 3:
				startWeekday = time.Wednesday
			case 4:
				startWeekday = time.Thursday
			case 5:
				startWeekday = time.Friday
			case 6:
				startWeekday = time.Saturday
			}
		}
	}

	files := form.File["file"]
	empls, err := services.GetEmployees(teamid, siteid)
	if err != nil {
		services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s GetEmployees: %s", logmsg, err.Error()))
		c.JSON(http.StatusBadRequest, notifications.Message{Message: err.Error()})
		return
	}
	switch strings.ToLower(ingestType) {
	case "sap":
		for _, file := range files {
			sapIngest := ingest.SAPIngest{
				TeamID: teamid,
			}
			records, start, end = sapIngest.ProcessFile(file)

			sort.Sort(ingest.ByExcelRow(records))

			// determine if CofS ingest by checking if any employee has less than 40
			// hours per week
			periods := period / 7
			checkHours := float64(periods) * 40.0
			bCofS := false

			empHours := 0.0
			empID := ""
			for _, rec := range records {
				if empID != rec.CompanyID {
					if empID != "" && checkHours > empHours {
						bCofS = true
					}
					empHours = 0.0
					empID = rec.CompanyID
				}
				if !rec.Modified {
					empHours += rec.Hours
				}
			}
			if empID != "" && checkHours > empHours {
				bCofS = true
			}

			if period < 15 {
				for start.Weekday() != startWeekday {
					start = start.AddDate(0, 0, -1)
				}
			}
			if bCofS {
				end = start.AddDate(0, 0, period)
			}

			/////////////////////////////////////////////////////////////////////////////
			// Algorithm for updating the employee records for leave and work
			// 1) Get a list of all employees at the site
			// 2) Sort the records by employee id, date, then hours.
			// 3) Create a list of all employees covered by the records.
			// 4) Step through the list of employees and remove leaves and work for the
			//    period.
			// 5) Step through the record and add leaves/work objects to either the
			//    employee or employee's work record.  Update the employee after adding
			//    a leave or create a new employee work record if the employee doesn't
			//    have one create it, if already present, update it.
			/////////////////////////////////////////////////////////////////////////////

			// step througn records to get list of employee ids, then step through this
			// list and remove leaves and work associated with these employees
			var employeeIDs []string
			for _, rec := range records {
				found := false
				for _, id := range employeeIDs {
					if rec.CompanyID == id {
						found = true
					}
				}
				if !found {
					employeeIDs = append(employeeIDs, rec.CompanyID)
				}
			}

			for _, id := range employeeIDs {
				for i, emp := range empls {
					if emp.CompanyInfo.Company == companyid &&
						(emp.CompanyInfo.EmployeeID == id ||
							emp.CompanyInfo.AlternateID == id) {
						emp.RemoveLeaves(start, end)
						services.UpdateEmployee(&emp)
						empls[i] = emp

						work, err := services.GetEmployeeWork(emp.ID.Hex(), uint(start.Year()))
						if err == nil {
							work.RemoveWork(start, end)
							services.UpdateEmployeeWork(work)
						}
						if start.Year() != end.Year() {
							work, err := services.GetEmployeeWork(emp.ID.Hex(), uint(end.Year()))
							if err == nil {
								work.RemoveWork(start, end)
								services.UpdateEmployeeWork(work)
							}
						}
					}
				}
			}

			for _, rec := range records {
				// find the employee in the employees list
				for i, emp := range empls {
					if emp.CompanyInfo.Company == companyid &&
						(emp.CompanyInfo.EmployeeID == rec.CompanyID ||
							emp.CompanyInfo.AlternateID == rec.CompanyID) {
						if rec.Code != "" {
							// leave, so add to employee and update
							lvid := -1
							for _, lv := range emp.Leaves {
								if lvid < lv.ID {
									lvid = lv.ID
								}
							}
							lv := employees.LeaveDay{
								ID:        lvid + 1,
								LeaveDate: rec.Date,
								Code:      rec.Code,
								Hours:     rec.Hours,
								Status:    "ACTUAL",
								RequestID: "",
							}
							emp.Leaves = append(emp.Leaves, lv)
							empls[i] = emp
							err := services.UpdateEmployee(&emp)
							if err != nil {
								services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
									fmt.Sprintf("%s UpdateEmployee (SAP): %s", logmsg, err.Error()))
							}
						} else {
							// work object, so get work record object for employee and year, then
							// add it to the work record, update it in the database.
							wr := employees.Work{
								DateWorked:   rec.Date,
								ChargeNumber: rec.ChargeNumber,
								Extension:    rec.Extension,
								PayCode:      converters.ParseInt(rec.Preminum),
								ModifiedTime: rec.Modified,
								Hours:        rec.Hours,
							}
							if rec.Modified {
								wr.Hours = wr.Hours * -1.0
							}
							workrec, err := services.GetEmployeeWork(emp.ID.Hex(),
								uint(rec.Date.Year()))
							if err != nil {
								workrec = &employees.EmployeeWorkRecord{
									ID:         primitive.NewObjectID(),
									EmployeeID: emp.ID,
									Year:       uint(rec.Date.Year()),
								}
								workrec.Work = append(workrec.Work, wr)
								services.CreateEmployeeWork(workrec)
							} else {
								workrec.Work = append(workrec.Work, wr)
								services.UpdateEmployeeWork(workrec)
							}
						}
					}
				}
			}
		}
	case "mexcel":
		var cNumbers []sites.ForecastReport
		for _, s := range team.Sites {
			if s.ID == siteid {
				for _, fr := range s.ForecastReports {
					if strings.EqualFold(fr.CompanyID, companyid) {
						cNumbers = append(cNumbers, fr)
					}
				}
			}
		}
		password := ""
		for _, co := range team.Companies {
			if co.ID == companyid {
				password = co.IngestPwd
			}
		}
		sDate := form.Value["start"][0]
		if sDate != "" {
			start, err = time.ParseInLocation("2006-01-02", sDate, time.UTC)
			if err != nil {
				services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
					fmt.Sprintf("%s Time Parse In Location: %s", logmsg, err.Error()))
			}
		}
		meIngest := ingest.ManualExcelIngest{
			Files:     files,
			StartDate: start,
			Password:  password,
		}
		records, start, end = meIngest.Process()

		////////////////////////////////////////////////////////////////////////////
		// Algorithm for updating the employee records for leave and work
		// 1) Get a list of all employees at the site
		// 2) Sort the records by employee id, date, then hours.
		// 3) Create a map of employee name (last, first) = employee object id
		// 4) Step through the list of employees and remove leaves and work for the
		//    period.
		// 5) Step through the record and add leaves/work objects to either the
		//    employee or employee's work record.  Update the employee after adding
		//    a leave or create a new employee work record if the employee doesn't
		//    have one create it, if already present, update it.
		/////////////////////////////////////////////////////////////////////////////

		sort.Sort(ingest.ByExcelRow(records))
		cEmployees := make(map[string]employees.Employee)
		// step througn records to get list of employee ids, then step through this
		// list and remove leaves and work associated with these employees
		for _, emp := range empls {
			if strings.EqualFold(emp.CompanyInfo.Company, companyid) &&
				(emp.IsActive(start) || emp.IsActive(end)) {
				emp.RemoveLeaves(start, end)
				services.UpdateEmployee(&emp)
				cEmployees[emp.Name.GetLastFirst()] = emp

				work, err := services.GetEmployeeWork(emp.ID.Hex(), uint(start.Year()))
				if err == nil {
					work.RemoveWork(start, end)
					services.UpdateEmployeeWork(work)
				} else if err == mongo.ErrNoDocuments {
					work = &employees.EmployeeWorkRecord{
						Year:       uint(start.Year()),
						EmployeeID: emp.ID,
					}
					services.CreateEmployeeWork(work)
				} else {
					fmt.Println(err)
				}
				if start.Year() != end.Year() {
					work, err := services.GetEmployeeWork(emp.ID.Hex(), uint(end.Year()))
					if err == nil {
						work.RemoveWork(start, end)
						services.UpdateEmployeeWork(work)
					} else if err == mongo.ErrNoDocuments {
						work = &employees.EmployeeWorkRecord{
							Year:       uint(end.Year()),
							EmployeeID: emp.ID,
						}
						services.CreateEmployeeWork(work)
					} else {
						fmt.Println(err)
					}
				}
			}
		}

		for _, rec := range records {
			// find the employee in the employees list
			for i, emp := range cEmployees {
				if strings.EqualFold(emp.Name.GetLastFirst(), rec.CompanyID) ||
					strings.EqualFold(emp.Name.GetLastFirstMI(), rec.CompanyID) {
					if rec.Code != "" {
						// leave, so add to employee and update
						// hours is the number of normal work hours
						hours := emp.GetStandardWorkday(rec.Date)

						// convert code to used by system
						for _, cd := range team.Workcodes {
							if strings.EqualFold(cd.AltCode, rec.Code) {
								rec.Code = cd.Id
							}
						}
						lvid := -1
						for _, lv := range emp.Leaves {
							if lvid < lv.ID {
								lvid = lv.ID
							}
						}
						lv := employees.LeaveDay{
							ID:        lvid + 1,
							LeaveDate: rec.Date,
							Code:      rec.Code,
							Hours:     hours,
							Status:    "ACTUAL",
							RequestID: "",
						}
						emp.Leaves = append(emp.Leaves, lv)
						cEmployees[i] = emp
						err := services.UpdateEmployee(&emp)
						if err != nil {
							services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
								fmt.Sprintf("%s UpdateEmployee (mexcel): %s", logmsg, err.Error()))
						}
					} else {
						cn := rec.ChargeNumber
						ext := rec.Extension
						// check to see if employee has a valid charge number/extension
						for _, fr := range cNumbers {
							if rec.Date.Equal(fr.StartDate) || rec.Date.Equal(fr.EndDate) ||
								(rec.Date.After(fr.StartDate) && rec.Date.Before(fr.EndDate)) {
								found := false
								for i := 0; i < len(emp.Assignments) && !found; i++ {
									asgmt := emp.Assignments[i]
									if rec.Date.Before(asgmt.EndDate) && rec.Date.After(asgmt.StartDate) {
										for _, alc := range asgmt.LaborCodes {
											for _, flc := range fr.LaborCodes {
												if strings.EqualFold(alc.ChargeNumber, flc.ChargeNumber) &&
													strings.EqualFold(alc.Extension, flc.Extension) {
													found = true
													cn = alc.ChargeNumber
													ext = alc.Extension
												}
											}
										}
									}
								}
							}
						}
						// work object, so get work record object for employee and year, then
						// add it to the work record, update it in the database.
						wr := employees.Work{
							DateWorked:   rec.Date,
							ChargeNumber: cn,
							Extension:    ext,
							PayCode:      1,
							Hours:        rec.Hours,
						}
						workrec, err := services.GetEmployeeWork(emp.ID.Hex(),
							uint(rec.Date.Year()))
						if err != nil {
							workrec = &employees.EmployeeWorkRecord{
								ID:         primitive.NewObjectID(),
								EmployeeID: emp.ID,
								Year:       uint(rec.Date.Year()),
							}
							workrec.Work = append(workrec.Work, wr)
							services.CreateEmployeeWork(workrec)
						} else {
							workrec.Work = append(workrec.Work, wr)
							services.UpdateEmployeeWork(workrec)
						}
					}
				}
			}
		}
	}

	// ensure the start date is the start of the company's workweek as provided
	// in the company record.
	for int(start.Weekday()) != startDay {
		start = start.AddDate(0, 0, -1)
	}

	companyEmployees, err := getEmployeesAfterIngest(teamid, siteid, companyid,
		uint(start.Year()), uint(end.Year()))
	if err != nil {
		services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s Ingest Files: GetEmployeesAfterIngest: %s", logmsg, err.Error()))
		c.JSON(http.StatusBadRequest, web.IngestResponse{Exception: err.Error()})
		return
	}

	c.JSON(http.StatusOK, web.IngestResponse{
		Employees:  companyEmployees,
		IngestType: ingestType,
		Exception:  "",
	})
}

func ManualIngestActions(c *gin.Context) {
	var data web.ManualIngestChanges
	logmsg := "IngestController: ManualIngestActions:"

	if err := c.ShouldBindJSON(&data); err != nil {
		services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s BindRequest: %s", logmsg, err.Error()))
		c.JSON(http.StatusBadRequest,
			web.SiteResponse{Team: nil, Site: nil, Exception: "Trouble with request"})
		return
	}

	// step through each employee change
	year := uint(time.Now().Year())
	for _, change := range data.Changes {
		if uint(change.Work.DateWorked.Year()) != year {
			year = uint(change.Work.DateWorked.Year())
		}
		// actions are different based on work or leave
		parts := strings.Split(change.ChangeType, "-")
		if parts[1] == "work" {
			work, err := services.GetEmployeeWork(change.EmployeeID,
				uint(change.Work.DateWorked.Year()))
			if err == nil {
				switch parts[0] {
				case "delete":
					for i := len(work.Work) - 1; i >= 0; i-- {
						wk := work.Work[i]
						if wk.DateWorked.Equal(change.Work.DateWorked) &&
							wk.ChargeNumber == change.Work.ChargeNumber &&
							wk.Extension == change.Work.Extension {
							work.Work = append(work.Work[:i], work.Work[i+1:]...)
						}
					}
				case "add":
					work.Work = append(work.Work, *change.Work)
				case "update":
					for i, wk := range work.Work {
						if wk.DateWorked.Equal(change.Work.DateWorked) {
							wk.Hours = change.Work.Hours
							work.Work[i] = wk
						}
					}
				}
				services.UpdateEmployeeWork(work)
			} else {
				empID, _ := primitive.ObjectIDFromHex(change.EmployeeID)
				work = &employees.EmployeeWorkRecord{
					ID:         primitive.NewObjectID(),
					EmployeeID: empID,
					Year:       uint(change.Work.DateWorked.Year()),
				}
				if parts[0] == "update" || parts[0] == "add" {
					work.Work = append(work.Work, *change.Work)
				}

				services.CreateEmployeeWork(work)
			}
		} else if parts[1] == "leave" {
			emp, err := services.GetEmployee(change.EmployeeID)
			if err == nil {
				switch parts[0] {
				case "delete":
					for i := len(emp.Leaves) - 1; i >= 0; i-- {
						lv := emp.Leaves[i]
						if lv.LeaveDate.Equal(change.Leave.LeaveDate) {
							emp.Leaves = append(emp.Leaves[:i],
								emp.Leaves[i+1:]...)
						}
					}
				case "add":
					emp.Leaves = append(emp.Leaves, *change.Leave)
				case "update":
					for i, lv := range emp.Leaves {
						if lv.LeaveDate.Equal(change.Leave.LeaveDate) {
							lv.Code = change.Leave.Code
							lv.Status = change.Leave.Status
							emp.Leaves[i] = lv
						}
					}
				}
				services.UpdateEmployee(emp)
			}
		}
	}
	companyEmployees, err := getEmployeesAfterIngest(data.TeamID, data.SiteID,
		data.CompanyID, year, year)
	if err != nil {
		services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s GetEmployeesAfterIngest: %s", logmsg, err.Error()))
		c.JSON(http.StatusBadRequest, web.IngestResponse{Exception: err.Error()})
	}

	c.JSON(http.StatusOK, web.IngestResponse{
		Employees:  companyEmployees,
		IngestType: "",
		Exception:  "",
	})
}
