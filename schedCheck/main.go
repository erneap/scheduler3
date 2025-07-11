package main

import (
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/erneap/models/v2/config"
	"github.com/erneap/models/v2/svcs"
)

// This application will cause a check of all teams' sites' workcenters'
// schedule coverage for required minimums.  This will be completed for
// each team, site, and workcenter-shift that has a required minimum
// above the zero threshold for the next 365 days.
// The following thoughts and requirements are to be used.
//  1. This application will be run separately of the web interface (APIs)
//     in a separate virtual enviroment (VM or container) as a cron job
//     at set periods per day (min once per day).
//  2. It will pull all teams and check if team is relavent.
//     a. Check each site within the team one as a time
//  1. Assign each site employee to the site record
//  2. loop through 365 days from current date
//     a) Assign site employees to workcenter for that date.
//     workcenter object should assign employee to shift based
//     on workcode for the date.
//     b) Check each workcenter that has shifts assignment and
//     process them one at a time.  Check each shift for minimum
//     coverage.  If not meeting minimums, create a notification
//     to each member of the site leadership team to be displayed
//     when they next log into the client.
func main() {

	// run database
	config.ConnectDB()

	// get all the teams
	teams, err := svcs.GetTeams()
	if err != nil {
		log.Fatalln(err)
	}

	for _, tm := range teams {
		for _, site := range tm.Sites {
			bProcess := false
			for _, wkctr := range site.Workcenters {
				if len(wkctr.Shifts) > 0 {
					for _, s := range wkctr.Shifts {
						if s.Minimums > 0 {
							bProcess = true
						}
					}
				}
			}
			if bProcess {
				eSite, err := svcs.GetSite(tm.ID.Hex(), site.ID)
				if err != nil {
					log.Fatalln(err)
				}
				// loop through dates
				now := time.Now()
				now = time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0,
					time.UTC)
				end := now.AddDate(1, 0, 0)
				siteEmps, _ := svcs.GetEmployees(tm.ID.Hex(), site.ID)
				for e, emp := range siteEmps {
					wr, err := svcs.GetEmployeeWork(emp.ID.Hex(), uint(now.Year()))
					if err == nil {
						emp.Work = append(emp.Work, wr.Work...)
					}
					if now.Year() != end.Year() {
						wr, err = svcs.GetEmployeeWork(emp.ID.Hex(), uint(end.Year()))
						if err == nil {
							emp.Work = append(emp.Work, wr.Work...)
						}
					}
					siteEmps[e] = emp
				}
				for now.Before(end) {
					for w, wkctr := range eSite.Workcenters {
						for s, sft := range wkctr.Shifts {
							sft.Employees = sft.Employees[:0]
							wkctr.Shifts[s] = sft
						}
						eSite.Workcenters[w] = wkctr
					}
					for _, emp := range siteEmps {
						if emp.AtSite(eSite.ID, now, now) {
							bPosition := false
							for _, wkctr := range eSite.Workcenters {
								for _, pos := range wkctr.Positions {
									for _, asgn := range pos.Assigned {
										if strings.EqualFold(emp.ID.Hex(), asgn) {
											bPosition = true
										}
									}
								}
							}
							if !bPosition {
								last := time.Date(1970, 1, 1, 0, 0, 0, 0, time.UTC)
								if len(emp.Work) > 0 {
									for _, wk := range emp.Work {
										if wk.DateWorked.After(last) {
											last = wk.DateWorked
										}
									}
								}
								wcode := emp.GetWorkday(now, last)
								if wcode != nil {
									for w, wc := range eSite.Workcenters {
										if strings.EqualFold(wc.ID, wcode.Workcenter) {
											for s, sft := range wc.Shifts {
												bShift := false
												for _, code := range sft.AssociatedCodes {
													if strings.EqualFold(code, wcode.Code) {
														bShift = true
													}
												}
												if bShift {
													sft.Employees = append(sft.Employees, emp)
													wc.Shifts[s] = sft
													eSite.Workcenters[w] = wc
												}
											}
										}
									}
								}
							}
						}
					}
					for _, wkctr := range eSite.Workcenters {
						if len(wkctr.Shifts) > 0 {
							for _, shft := range wkctr.Shifts {
								if shft.BelowMinimums() {
									msg := fmt.Sprintf("%s - %s - %s Shift below minimums",
										now.Format("2006-01-02"),
										strings.ToUpper(wkctr.ID),
										strings.ToUpper(shft.Name))
									// create notification message for each siteleader
									// at the site.
									for _, emp := range siteEmps {
										if emp.User.IsInGroup("scheduler", "siteleader") ||
											emp.User.IsInGroup("scheduler", "scheduler") {
											svcs.CreateCriticalMessage(emp.ID.Hex(), emp.ID.Hex(), msg)
										}
									}
									if err != nil {
										log.Fatalln(err)
									}
								}
							}
						}
					}
					now = now.AddDate(0, 0, 1)
				}
			}
		}
	}

	refNow := time.Now()
	log.Printf("Processed %s", refNow.Format("2006-01-02 1504"))
}
