package controllers

import (
	"bytes"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/erneap/go-models/notifications"
	"github.com/erneap/scheduler2/schedulerApi/models/reports"
	"github.com/erneap/scheduler2/schedulerApi/models/web"
	"github.com/erneap/scheduler2/schedulerApi/services"
	"github.com/gin-gonic/gin"
)

func CreateReport(c *gin.Context) {
	var data web.ReportRequest
	logmsg := "ReportsController: CreateReport:"
	if err := c.ShouldBindJSON(&data); err != nil {
		services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s BindingData Problem: %s", logmsg, err.Error()))
		c.JSON(http.StatusBadRequest,
			notifications.Message{Message: "Trouble with request: " + err.Error()})
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

	switch strings.ToLower(data.ReportType) {
	case "siteschedule":

		sr := reports.SiteScheduleReport{
			Date:   time.Now().UTC(),
			TeamID: data.TeamID,
			SiteID: data.SiteID,
		}
		if err := sr.Create(); err != nil {
			services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s Schedule Creation Problem: %s", logmsg, err.Error()))
			c.JSON(http.StatusInternalServerError, "Creation: "+err.Error())
			return
		}
		var b bytes.Buffer
		if err := sr.Report.Write(&b); err != nil {
			services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s Schedule Write Problem: %s", logmsg, err.Error()))
			c.JSON(http.StatusInternalServerError, "Buffer Write: "+err.Error())
			return
		}

		// get team to include in the download name
		team, _ := services.GetTeam(data.TeamID)
		site, _ := services.GetSite(data.TeamID, data.SiteID)
		downloadName := strings.ReplaceAll(team.Name, " ", "_") + "-" + site.Name +
			"-Schedule-" + sr.Date.Format("060102") + ".xlsx"
		c.Header("Content-Description", "File Transfer")
		c.Header("Content-Disposition", "attachment; filename="+downloadName)
		services.AddLogEntry(c, "scheduler", "SUCCESS", "CreateReport",
			fmt.Sprintf("Schedule Created: %s", downloadName))
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
			services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s Schedule Creation Problem: %s", logmsg, err.Error()))
			c.JSON(http.StatusInternalServerError, "Creation: "+err.Error())
			return
		}
		var b bytes.Buffer
		if err := sr.Report.Write(&b); err != nil {
			services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s Schedule Write Problem: %s", logmsg, err.Error()))
			c.JSON(http.StatusInternalServerError, "Buffer Write: "+err.Error())
			return
		}

		// get team to include in the download name
		team, _ := services.GetTeam(data.TeamID)
		site, _ := services.GetSite(data.TeamID, data.SiteID)
		downloadName := strings.ReplaceAll(team.Name, " ", "_") + "-" + site.Name +
			"-Schedule.xlsx"
		c.Header("Content-Description", "File Transfer")
		c.Header("Content-Disposition", "attachment; filename="+downloadName)
		services.AddLogEntry(c, "scheduler", "SUCCESS", "CreateReport",
			fmt.Sprintf("Schedule Created: %s", downloadName))
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
			services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s PTO-Holiday Problem: %s", logmsg, err.Error()))
			c.JSON(http.StatusInternalServerError, "Creation: "+err.Error())
			return
		}
		var b bytes.Buffer
		if err := lr.Report.Write(&b); err != nil {
			services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s PTO-Holiday Write Problem: %s", logmsg, err.Error()))
			c.JSON(http.StatusInternalServerError, "Buffer Write: "+err.Error())
			return
		}

		// get team to include in the download name
		team, _ := services.GetTeam(data.TeamID)
		site, _ := services.GetSite(data.TeamID, data.SiteID)
		downloadName := strings.ReplaceAll(team.Name, " ", "_") + "-" + site.Name +
			"-Leaves.xlsx"
		c.Header("Content-Description", "File Transfer")
		c.Header("Content-Disposition", "attachment; filename="+downloadName)
		services.AddLogEntry(c, "scheduler", "SUCCESS", "CreateReport",
			fmt.Sprintf("PTO/Holiday Report Created: %s", downloadName))
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
			services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s Charge Number Creation Problem: %s", logmsg, err.Error()))
			c.JSON(http.StatusInternalServerError, "Creation: "+err.Error())
			return
		}
		var b bytes.Buffer
		if err := laborrpt.Report.Write(&b); err != nil {
			services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s Charge Number Write Problem: %s", logmsg, err.Error()))
			c.JSON(http.StatusInternalServerError, "Buffer Write: "+err.Error())
			return
		}

		// get team to include in the download name
		team, _ := services.GetTeam(data.TeamID)
		site, _ := services.GetSite(data.TeamID, data.SiteID)
		downloadName := strings.ReplaceAll(team.Name, " ", "_") + "-" + site.Name +
			"-ChargeNumber-" + data.CompanyID + ".xlsx"
		c.Header("Content-Description", "File Transfer")
		c.Header("Content-Disposition", "attachment; filename="+downloadName)
		services.AddLogEntry(c, "scheduler", "SUCCESS", "CreateReport",
			fmt.Sprintf("Charge Number Status Report Created: Company: %s: Name: %s",
				strings.ToUpper(data.CompanyID), downloadName))
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
			services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s ModTime Report Creation Problem: %s", logmsg, err.Error()))
			c.JSON(http.StatusInternalServerError, "Creation: "+err.Error())
			return
		}
		var b bytes.Buffer
		if err := modrpt.Report.Write(&b); err != nil {
			services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s ModTime Report Write Problem: %s", logmsg, err.Error()))
			c.JSON(http.StatusInternalServerError, "Buffer Write: "+err.Error())
			return
		}

		// get team to include in the download name
		team, _ := services.GetTeam(data.TeamID)
		site, _ := services.GetSite(data.TeamID, data.SiteID)
		downloadName := strings.ReplaceAll(team.Name, " ", "_") + "-" + site.Name +
			"-ModTime-" + data.CompanyID + ".xlsx"
		c.Header("Content-Description", "File Transfer")
		c.Header("Content-Disposition", "attachment; filename="+downloadName)
		services.AddLogEntry(c, "scheduler", "SUCCESS", "CreateReport",
			fmt.Sprintf("ModTime Report Created: Company: %s: Name: %s",
				strings.ToUpper(data.CompanyID), downloadName))
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
			services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s CofS Creation Problem: %s", logmsg, err.Error()))
			c.JSON(http.StatusInternalServerError, "Creation: "+err.Error())
			return
		}
		downloadName := "CofSReports-" + reportDate.Format("20060102") + ".zip"
		c.Header("Content-Description", "File Transfer")
		c.Header("Content-Disposition", "attachment; filename="+downloadName)
		services.AddLogEntry(c, "scheduler", "SUCCESS", "CreateReport",
			fmt.Sprintf("CofS Zip File created: Month: %s, Name: %s",
				reportDate.Format("Jan-06"), downloadName))
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
			services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s Mids Report Creation Problem: %s", logmsg, err.Error()))
			c.JSON(http.StatusInternalServerError, "Creation: "+err.Error())
			return
		}
		var b bytes.Buffer
		if err := midRpt.Report.Write(&b); err != nil {
			services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s Mids Report Write Problem: %s", logmsg, err.Error()))
			c.JSON(http.StatusInternalServerError, "Buffer Write: "+err.Error())
			return
		}

		// get team to include in the download name
		team, _ := services.GetTeam(data.TeamID)
		site, _ := services.GetSite(data.TeamID, data.SiteID)
		downloadName := strings.ReplaceAll(team.Name, " ", "_") + "-" + site.Name +
			"-MidsSchedule.xlsx"
		c.Header("Content-Description", "File Transfer")
		c.Header("Content-Disposition", "attachment; filename="+downloadName)
		services.AddLogEntry(c, "scheduler", "SUCCESS", "CreateReport",
			fmt.Sprintf("Mid Report Created: %s", downloadName))
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
			services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s Schedule Creation Problem: %s", logmsg, err.Error()))
			c.JSON(http.StatusInternalServerError, "Creation: "+err.Error())
			return
		}
		var b bytes.Buffer
		if err := sr.Report.Write(&b); err != nil {
			services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
				fmt.Sprintf("%s Schedule Write Problem: %s", logmsg, err.Error()))
			c.JSON(http.StatusInternalServerError, "Buffer Write: "+err.Error())
			return
		}

		// get team to include in the download name
		team, _ := services.GetTeam(data.TeamID)
		site, _ := services.GetSite(data.TeamID, data.SiteID)
		downloadName := strings.ReplaceAll(team.Name, " ", "_") + "-" + site.Name +
			"-Enterprise.xlsx"
		c.Header("Content-Description", "File Transfer")
		c.Header("Content-Disposition", "attachment; filename="+downloadName)
		services.AddLogEntry(c, "scheduler", "SUCCESS", "CreateReport",
			fmt.Sprintf("Schedule Created: %s", downloadName))
		c.Data(http.StatusOK,
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			b.Bytes())
	default:
		services.AddLogEntry(c, "scheduler", "Error", "PROBLEM",
			fmt.Sprintf("%s No valid report requested: %s", logmsg, data.ReportType))
		c.JSON(http.StatusBadRequest, web.SiteResponse{
			Exception: "No valid report requested",
		})
	}
}
