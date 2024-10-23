package controllers

import (
	"bytes"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/erneap/go-models/general"
	"github.com/erneap/go-models/notifications"
	"github.com/erneap/go-models/reports"
	"github.com/erneap/go-models/svcs"
	"github.com/erneap/go-models/systemdata"
	"github.com/erneap/scheduler3/general-api/models"
	"github.com/gin-gonic/gin"
)

func CreateReport(c *gin.Context) {
	var data general.ReportRequest
	logmsg := "ReportsController: CreateReport:"
	userid := svcs.GetRequestor(c)
	user, _ := svcs.GetUserByID(userid)
	if err := c.ShouldBindJSON(&data); err != nil {
		svcs.CreateDBLogEntry("GeneralApi", " Reports Error", "CreateReport", user.LastName,
			fmt.Sprintf("%s BindingData Problem: %s", logmsg, err.Error()), c)
		c.JSON(http.StatusBadRequest,
			notifications.Message{Message: "Trouble with request: " + err.Error()})
		return
	}

	rtypes, err := svcs.GetReportTypes()
	if err != nil {
		svcs.CreateDBLogEntry("GeneralApi", " Reports Error", "Getting Report Types", user.LastName,
			fmt.Sprintf("%s Reports Types Problem: %s", logmsg, err.Error()), c)
		c.JSON(http.StatusBadRequest,
			notifications.Message{Message: "Trouble getting report types: " + err.Error()})
		return
	}

	now := time.Now().UTC()
	month := now.Month()
	day := now.Day()
	year := now.Year()
	if data.Period != "" {
		parts := strings.Split(data.Period, "|")
		if len(parts) > 0 {
			year, _ = strconv.Atoi(parts[0])
		}
		if len(parts) > 1 {
			tmonth, err := strconv.Atoi(parts[1])
			if err == nil {
				month = time.Month(tmonth)
			}
		}
		if len(parts) > 2 {
			day, _ = strconv.Atoi(parts[2])
		}
	}

	rtype := general.ReportType{}
	for _, rt := range rtypes {
		if strings.EqualFold(rt.ReportType, data.ReportType) {
			rtype = rt
		}
	}
	switch strings.ToLower(data.ReportType) {
	case "siteschedule":
		sr := reports.SiteScheduleReport{
			Date:   time.Now().UTC(),
			TeamID: data.TeamID,
			SiteID: data.SiteID,
		}
		if err := sr.Create(); err != nil {
			svcs.CreateDBLogEntry("GeneralApi", " Reports Error", "CreateReport", user.LastName,
				fmt.Sprintf("%s SiteSchedule Creation Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusInternalServerError, "Creation: "+err.Error())
			return
		}
		var b bytes.Buffer
		if err := sr.Report.Write(&b); err != nil {
			svcs.CreateDBLogEntry("GeneralApi", " Reports Error", "CreateReport", user.LastName,
				fmt.Sprintf("%s Schedule Write Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusInternalServerError, "Buffer Write: "+err.Error())
			return
		}

		// get team to include in the download name
		team, _ := svcs.GetTeam(data.TeamID)
		site, _ := svcs.GetSite(data.TeamID, data.SiteID)
		downloadName := strings.ReplaceAll(team.Name, " ", "_") + "-" + site.Name +
			"-Schedule-" + sr.Date.Format("060102") + ".xlsx"
		c.Header("Content-Description", "File Transfer")
		c.Header("Content-Disposition", "attachment; filename="+downloadName)
		svcs.CreateDBLogEntry("GeneralApi", " Reports Error", "CreateReport", user.LastName,
			fmt.Sprintf("Schedule Created %s", downloadName), c)
		_, err = svcs.AddReport(rtype.ID.Hex(), "",
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", b.Bytes())
		if err != nil {
			svcs.CreateDBLogEntry("GeneralApi", " Reports Error", "CreateReport", user.LastName,
				fmt.Sprintf("%s Schedule Write Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusInternalServerError, "Buffer Write: "+err.Error())
			return
		}
		c.Data(http.StatusOK,
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			b.Bytes())
	case "schedule":
		sr := reports.ScheduleReport{
			Year:   year,
			TeamID: data.TeamID,
			SiteID: data.SiteID,
		}
		if err := sr.Create(); err != nil {
			svcs.CreateDBLogEntry("GeneralApi", " Reports Error", "CreateReport", user.LastName,
				fmt.Sprintf("%s Schedule Creation Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusInternalServerError, "Creation: "+err.Error())
			return
		}
		var b bytes.Buffer
		if err := sr.Report.Write(&b); err != nil {
			svcs.CreateDBLogEntry("GeneralApi", " Reports Error", "CreateReport", user.LastName,
				fmt.Sprintf("%s SiteSchedule Write Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusInternalServerError, "Buffer Write: "+err.Error())
			return
		}

		// get team to include in the download name
		team, _ := svcs.GetTeam(data.TeamID)
		site, _ := svcs.GetSite(data.TeamID, data.SiteID)
		downloadName := strings.ReplaceAll(team.Name, " ", "_") + "-" + site.Name +
			"-Schedule.xlsx"
		c.Header("Content-Description", "File Transfer")
		c.Header("Content-Disposition", "attachment; filename="+downloadName)
		svcs.CreateDBLogEntry("GeneralApi", " Reports Error", "CreateReport", user.LastName,
			fmt.Sprintf("Schedule Creation: %s", downloadName), c)
		_, err = svcs.AddReport(rtype.ID.Hex(), "",
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", b.Bytes())
		if err != nil {
			svcs.CreateDBLogEntry("GeneralApi", " Reports Error", "CreateReport", user.LastName,
				fmt.Sprintf("%s Schedule Write Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusInternalServerError, "Buffer Write: "+err.Error())
			return
		}
		c.Data(http.StatusOK,
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			b.Bytes())
	case "ptoholiday":
		lr := reports.LeaveReport{
			Year:      year,
			TeamID:    data.TeamID,
			SiteID:    data.SiteID,
			CompanyID: data.CompanyID,
		}
		if err := lr.Create(); err != nil {
			svcs.CreateDBLogEntry("GeneralApi", " Reports Error", "CreateReport", user.LastName,
				fmt.Sprintf("%s PTO/Holiday Creation Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusInternalServerError, "Creation: "+err.Error())
			return
		}
		var b bytes.Buffer
		if err := lr.Report.Write(&b); err != nil {
			svcs.CreateDBLogEntry("GeneralApi", " Reports Error", "CreateReport", user.LastName,
				fmt.Sprintf("%s PTO/Holiday Write Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusInternalServerError, "Buffer Write: "+err.Error())
			return
		}

		// get team to include in the download name
		team, _ := svcs.GetTeam(data.TeamID)
		site, _ := svcs.GetSite(data.TeamID, data.SiteID)
		downloadName := strings.ReplaceAll(team.Name, " ", "_") + "-" + site.Name +
			"-Leaves.xlsx"
		c.Header("Content-Description", "File Transfer")
		c.Header("Content-Disposition", "attachment; filename="+downloadName)
		svcs.CreateDBLogEntry("GeneralApi", " Reports Error", "CreateReport", user.LastName,
			fmt.Sprintf("%PTO/Holiday Report Created: %s", downloadName), c)
		_, err = svcs.AddReport(rtype.ID.Hex(), "",
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", b.Bytes())
		if err != nil {
			svcs.CreateDBLogEntry("GeneralApi", " Reports Error", "CreateReport", user.LastName,
				fmt.Sprintf("%s PTO/Holiday Write Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusInternalServerError, "Buffer Write: "+err.Error())
			return
		}
		c.Data(http.StatusOK,
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			b.Bytes())
	case "chargenumber":
		reportDate := time.Date(year, month, day, 0, 0, 0, 0, time.UTC)
		laborrpt := reports.LaborReport{
			Date:      reportDate,
			TeamID:    data.TeamID,
			SiteID:    data.SiteID,
			CompanyID: data.CompanyID,
		}
		if err := laborrpt.Create(); err != nil {
			svcs.CreateDBLogEntry("GeneralApi", " Reports Error", "CreateReport", user.LastName,
				fmt.Sprintf("%s Charge Number Creation Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusInternalServerError, "Creation: "+err.Error())
			return
		}
		var b bytes.Buffer
		if err := laborrpt.Report.Write(&b); err != nil {
			svcs.CreateDBLogEntry("GeneralApi", " Reports Error", "CreateReport", user.LastName,
				fmt.Sprintf("%s Charge Number Write Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusInternalServerError, "Buffer Write: "+err.Error())
			return
		}

		// get team to include in the download name
		team, _ := svcs.GetTeam(data.TeamID)
		site, _ := svcs.GetSite(data.TeamID, data.SiteID)
		downloadName := strings.ReplaceAll(team.Name, " ", "_") + "-" + site.Name +
			"-ChargeNumber-" + data.CompanyID + ".xlsx"
		c.Header("Content-Description", "File Transfer")
		c.Header("Content-Disposition", "attachment; filename="+downloadName)
		svcs.CreateDBLogEntry("GeneralApi", " Reports Error", "CreateReport", user.LastName,
			fmt.Sprintf("Charge Number Status Report Created: Company: %s, Name: %s",
				strings.ToUpper(data.CompanyID), downloadName), c)
		_, err = svcs.AddReport(rtype.ID.Hex(), "",
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", b.Bytes())
		if err != nil {
			svcs.CreateDBLogEntry("GeneralApi", " Reports Error", "CreateReport", user.LastName,
				fmt.Sprintf("%s Charge Number Write Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusInternalServerError, "Buffer Write: "+err.Error())
			return
		}
		c.Data(http.StatusOK,
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			b.Bytes())
	case "modtime":
		reportDate := time.Date(year, month, day, 0, 0, 0, 0, time.UTC)
		modrpt := reports.ModTimeReport{
			Date:      reportDate,
			TeamID:    data.TeamID,
			SiteID:    data.SiteID,
			CompanyID: data.CompanyID,
		}
		if err := modrpt.Create(); err != nil {
			svcs.CreateDBLogEntry("GeneralApi", " Reports Error", "CreateReport", user.LastName,
				fmt.Sprintf("%s ModTime Report Creation Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusInternalServerError, "Creation: "+err.Error())
			return
		}
		var b bytes.Buffer
		if err := modrpt.Report.Write(&b); err != nil {
			svcs.CreateDBLogEntry("GeneralApi", " Reports Error", "CreateReport", user.LastName,
				fmt.Sprintf("%s ModTime Report Write Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusInternalServerError, "Buffer Write: "+err.Error())
			return
		}

		// get team to include in the download name
		team, _ := svcs.GetTeam(data.TeamID)
		site, _ := svcs.GetSite(data.TeamID, data.SiteID)
		downloadName := strings.ReplaceAll(team.Name, " ", "_") + "-" + site.Name +
			"-ModTime-" + data.CompanyID + ".xlsx"
		c.Header("Content-Description", "File Transfer")
		c.Header("Content-Disposition", "attachment; filename="+downloadName)
		svcs.CreateDBLogEntry("GeneralApi", " Reports Error", "CreateReport", user.LastName,
			fmt.Sprintf("ModTime Report Created: Company: %s: Name: %s",
				strings.ToUpper(data.CompanyID), downloadName), c)
		_, err = svcs.AddReport(rtype.ID.Hex(), "",
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", b.Bytes())
		if err != nil {
			svcs.CreateDBLogEntry("GeneralApi", " Reports Error", "CreateReport", user.LastName,
				fmt.Sprintf("%s Charge Number Write Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusInternalServerError, "Buffer Write: "+err.Error())
			return
		}
		c.Data(http.StatusOK,
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			b.Bytes())
	case "cofs":
		reportDate := time.Date(year, month, 1, 0, 0, 0, 0,
			time.UTC)
		cofsReport := reports.ReportCofS{
			Date:   reportDate,
			TeamID: data.TeamID,
			SiteID: data.SiteID,
		}
		if err := cofsReport.Create(); err != nil {
			svcs.CreateDBLogEntry("GeneralApi", " Reports Error", "CreateReport", user.LastName,
				fmt.Sprintf("%s CofS Creation Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusInternalServerError, "Creation: "+err.Error())
			return
		}
		downloadName := "CofSReports-" + reportDate.Format("20060102") + ".zip"
		c.Header("Content-Description", "File Transfer")
		c.Header("Content-Disposition", "attachment; filename="+downloadName)
		svcs.CreateDBLogEntry("GeneralApi", " Reports Error", "CreateReport", user.LastName,
			fmt.Sprintf("CofS Zip File created: Month: %s, Name: %s",
				reportDate.Format("Jan-06"), downloadName), c)
		_, err = svcs.AddReport(rtype.ID.Hex(), "",
			"application/zip", cofsReport.Buffer.Bytes())
		if err != nil {
			svcs.CreateDBLogEntry("GeneralApi", " Reports Error", "CreateReport", user.LastName,
				fmt.Sprintf("%s Charge Number Write Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusInternalServerError, "Buffer Write: "+err.Error())
			return
		}
		c.Data(http.StatusOK,
			"application/zip", cofsReport.Buffer.Bytes())
	case "midshift":
		reportDate := time.Now().UTC()
		midRpt := reports.MidShiftReport{
			Date:   reportDate,
			TeamID: data.TeamID,
			SiteID: data.SiteID,
		}

		if err := midRpt.Create(); err != nil {
			svcs.CreateDBLogEntry("GeneralApi", " Reports Error", "CreateReport", user.LastName,
				fmt.Sprintf("%s Mids Report Creation Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusInternalServerError, "Creation: "+err.Error())
			return
		}
		var b bytes.Buffer
		if err := midRpt.Report.Write(&b); err != nil {
			svcs.CreateDBLogEntry("GeneralApi", " Reports Error", "CreateReport", user.LastName,
				fmt.Sprintf("%s Mids Report Write Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusInternalServerError, "Buffer Write: "+err.Error())
			return
		}

		// get team to include in the download name
		team, _ := svcs.GetTeam(data.TeamID)
		site, _ := svcs.GetSite(data.TeamID, data.SiteID)
		downloadName := strings.ReplaceAll(team.Name, " ", "_") + "-" + site.Name +
			"-MidsSchedule.xlsx"
		c.Header("Content-Description", "File Transfer")
		c.Header("Content-Disposition", "attachment; filename="+downloadName)
		svcs.CreateDBLogEntry("GeneralApi", " Reports Error", "CreateReport", user.LastName,
			fmt.Sprintf("Mid Report Created: %s", downloadName), c)
		_, err = svcs.AddReport(rtype.ID.Hex(), "",
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", b.Bytes())
		if err != nil {
			svcs.CreateDBLogEntry("GeneralApi", " Reports Error", "CreateReport", user.LastName,
				fmt.Sprintf("%s MidShift Write Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusInternalServerError, "Buffer Write: "+err.Error())
			return
		}
		c.Data(http.StatusOK,
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			b.Bytes())
	case "enterprise":
		sr := reports.EnterpriseSchedule{
			Year:   year,
			TeamID: data.TeamID,
			SiteID: data.SiteID,
		}
		if err := sr.Create(); err != nil {
			svcs.CreateDBLogEntry("GeneralApi", " Reports Error", "CreateReport", user.LastName,
				fmt.Sprintf("%s Enterprise Schedule Creation Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusInternalServerError, "Creation: "+err.Error())
			return
		}
		var b bytes.Buffer
		if err := sr.Report.Write(&b); err != nil {
			svcs.CreateDBLogEntry("GeneralApi", " Reports Error", "CreateReport", user.LastName,
				fmt.Sprintf("%s Enterprise Schedule Write Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusInternalServerError, "Buffer Write: "+err.Error())
			return
		}

		// get team to include in the download name
		team, _ := svcs.GetTeam(data.TeamID)
		site, _ := svcs.GetSite(data.TeamID, data.SiteID)
		downloadName := strings.ReplaceAll(team.Name, " ", "_") + "-" + site.Name +
			"-Enterprise.xlsx"
		c.Header("Content-Description", "File Transfer")
		c.Header("Content-Disposition", "attachment; filename="+downloadName)
		svcs.CreateDBLogEntry("GeneralApi", " Reports Error", "CreateReport", user.LastName,
			fmt.Sprintf("Schedule Created: %s", downloadName), c)
		_, err = svcs.AddReport(rtype.ID.Hex(), "",
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", b.Bytes())
		if err != nil {
			svcs.CreateDBLogEntry("GeneralApi", " Reports Error", "CreateReport", user.LastName,
				fmt.Sprintf("%s Enterprise Schedule Write Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusInternalServerError, "Buffer Write: "+err.Error())
			return
		}
		c.Data(http.StatusOK,
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			b.Bytes())
	case "mission summary":
		rptType := systemdata.ALL
		switch strings.ToLower(data.SubReport) {
		case "geoint":
			rptType = systemdata.GEOINT
		case "syers":
			rptType = systemdata.SYERS
		case "ddsa":
			rptType = systemdata.MIST
		case "xint":
			rptType = systemdata.XINT
		}
		period, err := strconv.ParseUint(data.Period, 10, 32)
		if err != nil {
			svcs.CreateDBLogEntry("GeneralApi", " Reports Error", "CreateReport", user.LastName,
				fmt.Sprintf("%s Mission Summary Data Conversion Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusInternalServerError, "Conversion Write: "+err.Error())
			return
		}
		start, err := time.ParseInLocation("2006|01|02", data.StartDate, time.UTC)
		if err != nil {
			c.JSON(http.StatusBadRequest, "Start Date Problem: "+err.Error())
			fmt.Println(err)
			return
		}
		var end time.Time
		if data.EndDate != "" {
			end, err = time.ParseInLocation("2006|01|02", data.EndDate, time.UTC)
			if err != nil {
				c.JSON(http.StatusBadRequest, "End Date Problem: "+err.Error())
				fmt.Println(err)
				return
			}
		}
		msnsum := reports.MissionSummary{
			ReportType:   rptType,
			ReportPeriod: uint(period),
			StartDate:    start,
			EndDate:      end,
			Daily:        data.IncludeDaily,
		}
		workbook, err := msnsum.Create()
		if err != nil {
			svcs.CreateDBLogEntry("GeneralApi", " Reports Error", "CreateReport", user.LastName,
				fmt.Sprintf("%s Mission Summary Creation Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusInternalServerError, "Creation Problem: "+err.Error())
			return
		}

		var b bytes.Buffer
		if err := workbook.Write(&b); err != nil {
			svcs.CreateDBLogEntry("GeneralApi", " Reports Error", "CreateReport", user.LastName,
				fmt.Sprintf("%s Mission Summary Write Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusInternalServerError, "Buffer Write: "+err.Error())
			return
		}
		downloadName := "Msn_Summary.xlsx"
		c.Header("Content-Description", "File Transfer")
		c.Header("Content-Disposition", "attachment; filename="+downloadName)
		_, err = svcs.AddReport(rtype.ID.Hex(), string(rptType),
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", b.Bytes())
		if err != nil {
			svcs.CreateDBLogEntry("GeneralApi", " Reports Error", "CreateReport", user.LastName,
				fmt.Sprintf("%s Mission Summary Write Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusInternalServerError, "Buffer Write: "+err.Error())
			return
		}
		c.Data(http.StatusOK,
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			b.Bytes())
	case "draw summary":
		rptType := systemdata.ALL
		switch strings.ToLower(data.SubReport) {
		case "geoint":
			rptType = systemdata.GEOINT
		case "syers":
			rptType = systemdata.SYERS
		case "ddsa":
			rptType = systemdata.MIST
		case "xint":
			rptType = systemdata.XINT
		}
		period, err := strconv.ParseUint(data.Period, 10, 32)
		if err != nil {
			svcs.CreateDBLogEntry("GeneralApi", " Reports Error", "CreateReport", user.LastName,
				fmt.Sprintf("%s Mission Summary Data Conversion Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusInternalServerError, "Conversion Write: "+err.Error())
			return
		}
		start, err := time.ParseInLocation("2006|01|02", data.StartDate, time.UTC)
		if err != nil {
			c.JSON(http.StatusBadRequest, "Start Date Problem: "+err.Error())
			fmt.Println(err)
			return
		}
		var end time.Time
		if data.EndDate != "" {
			end, err = time.ParseInLocation("2006|01|02", data.EndDate, time.UTC)
			if err != nil {
				c.JSON(http.StatusBadRequest, "End Date Problem: "+err.Error())
				fmt.Println(err)
				return
			}
		}
		draw := reports.DrawSummary{
			ReportType:   rptType,
			ReportPeriod: uint(period),
			StartDate:    start,
			EndDate:      end,
			Daily:        data.IncludeDaily,
		}
		workbook, err := draw.Create()
		if err != nil {
			svcs.CreateDBLogEntry("GeneralApi", " Reports Error", "CreateReport", user.LastName,
				fmt.Sprintf("%s Draw Report Creation Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusInternalServerError, "Creation Problem: "+err.Error())
			return
		}

		var b bytes.Buffer
		if err := workbook.Write(&b); err != nil {
			svcs.CreateDBLogEntry("GeneralApi", " Reports Error", "CreateReport", user.LastName,
				fmt.Sprintf("%s Draw Report Write Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusInternalServerError, "Buffer Write: "+err.Error())
			return
		}
		_, err = svcs.AddReport(rtype.ID.Hex(), string(rptType),
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", b.Bytes())
		if err != nil {
			svcs.CreateDBLogEntry("GeneralApi", " Reports Error", "CreateReport", user.LastName,
				fmt.Sprintf("%s Draw Report Write Problem: %s", logmsg, err.Error()), c)
			c.JSON(http.StatusInternalServerError, "Buffer Write: "+err.Error())
			return
		}

		drawName := "DrawReport.xlsx"
		c.Header("Content-Description", "File Transfer")
		c.Header("Content-Disposition", "attachment; filename="+drawName)
		c.Data(http.StatusOK,
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			b.Bytes())
	case "xint":
		c.JSON(http.StatusNotFound, models.ReportTypeList{
			Exception: "XINT Report Not Found",
		})
	default:
		svcs.CreateDBLogEntry("GeneralApi", " Reports Error", "CreateReport", user.LastName,
			fmt.Sprintf("%s No valid report requested: %s", logmsg, data.ReportType), c)
		c.JSON(http.StatusBadRequest, models.ReportTypeList{
			Exception: "No valid report requested",
		})
	}
}
