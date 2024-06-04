package reports

import (
	"archive/zip"
	"bytes"
	"fmt"
	"math"
	"sort"
	"strings"
	"time"

	"github.com/erneap/go-models/employees"
	"github.com/erneap/go-models/sites"
	"github.com/erneap/go-models/teams"
	"github.com/erneap/scheduler2/schedulerApi/services"
)

type ReportCofS struct {
	Date          time.Time
	TeamID        string
	Companies     map[string]teams.Company
	LeaveCodes    map[string]teams.Workcode
	ExerciseCodes []employees.EmployeeLaborCode
	SiteID        string
	Site          sites.Site
	Writer        *zip.Writer
	Buffer        *bytes.Buffer
	StartDate     time.Time
	EndDate       time.Time
	Remarks       []string
}

// //////////////////////////////////////////////////////////
// The idea for this report creation is to create the CofS
// XML files separately, then zip them up into a single file
// and use that for the https response.
// //////////////////////////////////////////////////////////
func (cr *ReportCofS) Create() error {
	// First get the site based on teamid and siteid
	site, err := services.GetSite(cr.TeamID, cr.SiteID)
	if err != nil {
		return err
	}
	cr.Site = *site

	// next get the list of companies associated with this
	// the team
	cr.Companies = make(map[string]teams.Company)
	cr.LeaveCodes = make(map[string]teams.Workcode)
	team, err := services.GetTeam(cr.TeamID)
	if err != nil {
		return err
	}
	for _, co := range team.Companies {
		cr.Companies[co.ID] = co
	}
	for _, wc := range team.Workcodes {
		if wc.IsLeave {
			cr.LeaveCodes[wc.Id] = wc
		}
	}

	// get workrecords for employees
	for e, emp := range cr.Site.Employees {
		emp.Work = emp.Work[:0]
		work, err := services.GetEmployeeWork(emp.ID.Hex(),
			uint(cr.Date.Year()))
		if err == nil {
			emp.Work = append(emp.Work, work.Work...)
			cr.Site.Employees[e] = emp
		}
	}

	// set start date as first day of month and end date as
	// first day of next month
	cr.StartDate = time.Date(cr.Date.Year(), cr.Date.Month(),
		1, 0, 0, 0, 0, time.UTC)
	cr.EndDate = cr.StartDate.AddDate(0, 1, 0)

	// get any exercise codes in period
	for _, frct := range cr.Site.ForecastReports {
		for _, flc := range frct.LaborCodes {
			if flc.Exercise && cr.StartDate.Before(flc.EndDate) &&
				cr.EndDate.After(flc.StartDate) {
				elc := employees.EmployeeLaborCode{
					ChargeNumber: flc.ChargeNumber,
					Extension:    flc.Extension,
				}
				cr.ExerciseCodes = append(cr.ExerciseCodes, elc)
			}
		}
	}

	// create zip file in a memory buffer to allow the file
	// to be added to it.
	cr.Buffer = new(bytes.Buffer)
	cr.Writer = zip.NewWriter(cr.Buffer)

	for _, cofs := range site.CofSReports {
		if !(cr.EndDate.Before(cofs.StartDate) || cr.StartDate.After(cofs.EndDate)) {
			// create this CofS Report as it is in the date range
			if len(cofs.Companies) > 0 && len(cofs.Sections) <= 0 {
				err = cr.CreateCofSXML(&cofs)
			} else if len(cofs.Sections) > 0 {
				err = cr.CreateCofSXMLSections(&cofs)
			}
			if err != nil {
				return err
			}
		}
	}

	err = cr.Writer.Close()

	return err
}

func (cr *ReportCofS) CreateCofSXML(rpt *sites.CofSReport) error {
	// this xml file will have the filename of the report's
	// shortname + date create + .xml
	filename := rpt.ShortName + "-" +
		cr.Date.Format("20060102") + ".xml"
	var sb strings.Builder
	cr.Remarks = cr.Remarks[:0]

	// xml header information added first
	sb.WriteString("<?xml version=\"1.0\" encoding=\"UTF-8\"" +
		" standalone=\"yes\" ?>")
	sb.WriteString("<fields xmlns:xsi=\"http://www.w3.org/2001/" +
		"XMLSchema-instance\">")
	sb.WriteString("<Month-Year>" + cr.Date.Format("Jan-2006") +
		"</Month-Year>")
	sb.WriteString("<Month-Year1>" + cr.Date.Format("Jan-2006") +
		"</Month-Year1>")
	sb.WriteString("<Unit>" + rpt.AssociatedUnit + "</Unit>")
	sb.WriteString("<Unit1>" + rpt.AssociatedUnit + "</Unit1>")

	sort.Sort(sites.ByCofSCompany(rpt.Companies))

	for c, co := range rpt.Companies {
		if company, ok := cr.Companies[co.ID]; ok {
			sb.WriteString(fmt.Sprintf("<Company%d>%s</Company%d>",
				c+1, company.Name, c+1))
			count := 0
			for _, emp := range cr.Site.Employees {
				if emp.IsActive(cr.StartDate) ||
					emp.IsActive(cr.EndDate.AddDate(0, 0, -1)) {
					hours := 0.0
					bPrimary := false
					for _, lc := range co.LaborCodes {
						hours += emp.GetWorkedHoursForLabor(
							lc.ChargeNumber, lc.Extension, cr.StartDate,
							cr.EndDate)
						if emp.IsPrimaryCode(cr.StartDate, lc.ChargeNumber, lc.Extension) ||
							emp.IsPrimaryCode(cr.EndDate, lc.ChargeNumber, lc.Extension) {
							bPrimary = true
						}
					}

					if hours > 0.0 || bPrimary {
						var laborCodes []employees.EmployeeLaborCode
						for _, lc := range co.LaborCodes {
							elc := &employees.EmployeeLaborCode{
								ChargeNumber: lc.ChargeNumber,
								Extension:    lc.Extension,
							}
							laborCodes = append(laborCodes, *elc)
						}
						count++
						empString := cr.CreateEmployeeData(count, c+1, emp,
							laborCodes, company.Name, false)
						sb.WriteString(empString)
					}
				}
			}
		}
		if co.AddExercises && len(cr.ExerciseCodes) > 0 {
			count := 0
			for _, emp := range cr.Site.Employees {
				if emp.IsActive(cr.StartDate) ||
					emp.IsActive(cr.EndDate.AddDate(0, 0, -1)) {
					hours := 0.0
					for _, lc := range cr.ExerciseCodes {
						hours += emp.GetWorkedHoursForLabor(
							lc.ChargeNumber, lc.Extension, cr.StartDate,
							cr.EndDate)
					}

					if hours > 0.0 {
						count++
						empString := cr.CreateEmployeeData(count, c+2, emp,
							cr.ExerciseCodes, "", true)
						sb.WriteString(empString)
					}
				}
			}
		}
	}

	if len(cr.Remarks) > 0 {
		sb.WriteString("<REMARKS>")
		for r, rmk := range cr.Remarks {
			if r > 0 {
				sb.WriteString("\n")
			}
			sb.WriteString(rmk)
		}
		sb.WriteString("</REMARKS>")
	}

	sb.WriteString("</fields>")

	content := []byte(sb.String())
	zipFile, err := cr.Writer.Create(filename)
	if err != nil {
		return err
	}
	_, err = zipFile.Write(content)

	return err
}

func (cr *ReportCofS) CreateCofSXMLSections(rpt *sites.CofSReport) error {
	// this xml file will have the filename of the report's
	// shortname + date create + .xml
	filename := rpt.ShortName + "-" +
		cr.Date.Format("20060102") + ".xml"
	var sb strings.Builder
	cr.Remarks = cr.Remarks[:0]

	// xml header information added first
	sb.WriteString("<?xml version=\"1.0\" encoding=\"UTF-8\"" +
		" standalone=\"yes\" ?>")
	sb.WriteString("<fields xmlns:xsi=\"http://www.w3.org/2001/" +
		"XMLSchema-instance\">")
	sb.WriteString("<Month-Year>" + cr.Date.Format("Jan-2006") +
		"</Month-Year>")
	sb.WriteString("<Month-Year1>" + cr.Date.Format("Jan-2006") +
		"</Month-Year1>")
	sb.WriteString("<Unit>" + rpt.AssociatedUnit + "</Unit>")
	sb.WriteString("<Unit1>" + rpt.AssociatedUnit + "</Unit1>")

	sort.Sort(sites.ByCofSSection(rpt.Sections))

	for c, sect := range rpt.Sections {
		sb.WriteString(fmt.Sprintf("<Company%d>%s</Company%d>",
			c+1, sect.Label, c+1))
		sb.WriteString(fmt.Sprintf("<Section%d_Lead>%s</Section%d_Lead>",
			c+1, sect.SignatureBlock, c+1))
		if sect.ShowUnit {
			sb.WriteString(fmt.Sprintf("<Unit%d>%s</Unit%d>", c+1,
				rpt.AssociatedUnit, c+1))
		}
		count := 0
		for _, emp := range cr.Site.Employees {
			if emp.IsActive(cr.StartDate) ||
				emp.IsActive(cr.EndDate.AddDate(0, 0, -1)) {
				hours := 0.0
				bPrimary := false
				for _, lc := range sect.LaborCodes {
					hours += emp.GetWorkedHoursForLabor(
						lc.ChargeNumber, lc.Extension, cr.StartDate,
						cr.EndDate)
					if emp.IsPrimaryCode(cr.StartDate, lc.ChargeNumber, lc.Extension) ||
						emp.IsPrimaryCode(cr.EndDate, lc.ChargeNumber, lc.Extension) {
						bPrimary = true
					}
				}

				if hours > 0.0 || bPrimary {
					var laborCodes []employees.EmployeeLaborCode
					for _, lc := range sect.LaborCodes {
						elc := &employees.EmployeeLaborCode{
							ChargeNumber: lc.ChargeNumber,
							Extension:    lc.Extension,
						}
						laborCodes = append(laborCodes, *elc)
					}
					count++
					empString := cr.CreateEmployeeData(count, c+1, emp,
						laborCodes, sect.CompanyID, false)
					sb.WriteString(empString)
				}
			}
		}
	}

	if len(cr.Remarks) > 0 {
		sb.WriteString("<REMARKS>")
		for r, rmk := range cr.Remarks {
			if r > 0 {
				sb.WriteString("\n")
			}
			sb.WriteString(rmk)
		}
		sb.WriteString("</REMARKS>")
	}

	sb.WriteString("</fields>")

	content := []byte(sb.String())
	zipFile, err := cr.Writer.Create(filename)
	if err != nil {
		return err
	}
	_, err = zipFile.Write(content)

	return err
}

func (cr *ReportCofS) CreateEmployeeData(count, coCount int,
	emp employees.Employee, labor []employees.EmployeeLaborCode,
	company string, bExercise bool) string {
	var esb strings.Builder
	total := 0.0
	label := fmt.Sprintf("NameRow%d", count)
	if coCount > 1 {
		label += fmt.Sprintf("_%d", coCount)
	}
	esb.WriteString(fmt.Sprintf(
		"<%s>%s</%s>", label, emp.Name.GetLastFirstMI(), label))
	label = fmt.Sprintf("PositionRow%d", count)
	if coCount > 1 {
		label += fmt.Sprintf("_%d", coCount)
	}
	esb.WriteString(fmt.Sprintf(
		"<%s>%s</%s>", label, emp.CompanyInfo.JobTitle,
		label))
	current := time.Date(cr.StartDate.Year(),
		cr.StartDate.Month(), cr.StartDate.Day(), 0, 0, 0, 0,
		time.UTC)
	for current.Before(cr.EndDate) {
		hours := 0.0
		label := fmt.Sprintf("Section%dRow%d_%02d", coCount,
			count, current.Day())
		for _, lc := range labor {
			lcExercise := false
			for _, ec := range cr.ExerciseCodes {
				if strings.EqualFold(lc.ChargeNumber, ec.ChargeNumber) &&
					strings.EqualFold(lc.Extension, ec.Extension) {
					lcExercise = true
				}
			}
			if !lcExercise || bExercise {
				hours += emp.GetWorkedHoursForLabor(lc.ChargeNumber,
					lc.Extension, current, current.AddDate(0, 0, 1))
			}
		}
		if hours > 0.0 {
			hours = (math.Floor(hours * 10)) / 10.0
			total += hours
			iHours := int(math.Floor(hours * 10))
			cHours := int(math.Floor(hours) * 10)
			if cHours == iHours {
				esb.WriteString(fmt.Sprintf("<%s>%.0f</%s>", label,
					hours, label))
			} else {
				esb.WriteString(fmt.Sprintf("<%s>%.1f</%s>", label,
					hours, label))
			}
			if hours > 12.0 {
				remark := fmt.Sprintf("%s: %s %s received a safety briefing for "+
					"working over 12 hours on %s.",
					strings.ToUpper(company), emp.Name.FirstName, emp.Name.LastName,
					current.Format("02 January"))
				cr.Remarks = append(cr.Remarks, remark)
			}
		} else if !bExercise {
			wd := emp.GetWorkdayActual(current)
			if wd != nil && wd.Code != "" {
				if wc, ok := cr.LeaveCodes[wd.Code]; ok && wc.AltCode != "" {
					esb.WriteString(fmt.Sprintf("<%s>%s</%s>", label,
						wc.AltCode, label))
				} else {
					esb.WriteString(fmt.Sprintf("<%s/>", label))
				}
			} else {
				esb.WriteString(fmt.Sprintf("<%s/>", label))
			}
		} else {
			esb.WriteString(fmt.Sprintf("<%s/>", label))
		}
		current = current.AddDate(0, 0, 1)
	}
	// add total hours but label for row depends on company count
	// if greater than 1 add company count after count
	label = fmt.Sprintf("TotalHoursRow%d", count)
	if coCount > 1 {
		label += fmt.Sprintf("_%d", coCount)
	}
	total = (math.Floor(total * 10)) / 10
	esb.WriteString(fmt.Sprintf("<%s>%.1f</%s>", label, total,
		label))
	if total > 200.0 {
		remark := fmt.Sprintf("%s: %s %s exceeded 200 hours to support ops tempo.",
			company, emp.Name.FirstName, emp.Name.LastName)
		cr.Remarks = append(cr.Remarks, remark)
	}

	return esb.String()
}
