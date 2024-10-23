package controllers

import (
	"fmt"
	"net/http"
	"sort"
	"strings"

	"github.com/erneap/go-models/general"
	"github.com/erneap/go-models/svcs"
	"github.com/erneap/scheduler3/general-api/models"
	"github.com/gin-gonic/gin"
)

// This routine/function will provide the list of report types available
// for viewing
func GetReportTypes(c *gin.Context) {
	app := c.Param("app")

	ans := models.ReportTypeList{}

	rTypes, err := svcs.GetReportTypesByApplication(app)
	if err != nil {
		userid := svcs.GetRequestor(c)
		user, err2 := svcs.GetUserByID(userid)
		userName := ""
		if err2 == nil {
			userName = user.LastName
		}
		ans.Exception = fmt.Sprintf("Problem getting report types: %s", err.Error())
		svcs.CreateDBLogEntry("General", "Reports", "GetReportsTypes", userName,
			ans.Exception, c)
		c.JSON(http.StatusBadRequest, ans)
		return
	}

	ans.ReportTypes = rTypes

	c.JSON(http.StatusOK, &ans)
}

func GetReport(c *gin.Context) {
	id := c.Param("id")
	fmt.Println(id)
	userid := svcs.GetRequestor(c)
	user, err := svcs.GetUserByID(userid)
	if err != nil {
		svcs.CreateDBLogEntry("GeneralAPI", "Report", "User Error", "",
			fmt.Sprintf("GetReport: User Error: %s", err.Error()), c)
	}
	if id == "" {
		if user != nil {
			svcs.CreateDBLogEntry("GeneralAPI", "Report", "Report Error", user.LastName,
				"No User given in parameters", c)
		}
		c.JSON(http.StatusNotFound, models.ReportList{
			Exception: "No User given in parameter",
		})
		return
	}
	rpt, err := svcs.GetReport(id)
	if err != nil {
		svcs.CreateDBLogEntry("GeneralAPI", "Report", "Report Error", "",
			fmt.Sprintf("GetReport: Report Error: %s", err.Error()), c)
		c.JSON(http.StatusNotFound, models.ReportList{
			Exception: "Report Error: " + err.Error(),
		})
		return
	}
	buffer, err := rpt.GetDocument()
	if err != nil {
		svcs.CreateDBLogEntry("GeneralAPI", "Report", "Report Error", "",
			fmt.Sprintf("GetReport: Report Document Error: %s", err.Error()), c)
		c.JSON(http.StatusNotFound, models.ReportList{
			Exception: "Report Document Error: " + err.Error(),
		})
		return
	}
	rptType, err := svcs.GetReportType(rpt.ReportTypeID.Hex())
	if err != nil {
		svcs.CreateDBLogEntry("GeneralAPI", "Report", "Report Error", "",
			fmt.Sprintf("GetReport: Report Type Error: %s", err.Error()), c)
		c.JSON(http.StatusNotFound, models.ReportList{
			Exception: "Report Type Error: " + err.Error(),
		})
		return
	}
	rptName := fmt.Sprintf("%s-%s", rptType.ReportTypeName, rpt.ReportDate.Format("2005-01-02"))
	if strings.EqualFold(rpt.MimeType, "application/zip") {
		rptName += ".zip"
	} else {
		rptName += ".xlsx"
	}
	c.Header("Content-Description", "File Transfer")
	c.Header("Content-Disposition", "attachment; filename="+rptName)
	c.Data(http.StatusOK, rpt.MimeType, buffer)
}

func GetReportList(c *gin.Context) {
	typeid := c.Param("typeid")

	if typeid != "" {
		rptType, err := svcs.GetReportType(typeid)
		if err != nil {
			svcs.CreateDBLogEntry("GeneralAPI", "GetReportList", "ReportList Get Error", "",
				fmt.Sprintf("GetReportList: Service Error: %s", err.Error()), c)
			c.JSON(http.StatusBadRequest, models.ReportList{
				Exception: "GetReportList: Service Error: " + err.Error(),
			})
			return
		}
		rpts, err := svcs.GetReportsByType(typeid)
		if err != nil {
			svcs.CreateDBLogEntry("GeneralAPI", "GetReportList", "ReportList Get Error", "",
				fmt.Sprintf("GetReportList: Service Error: %s", err.Error()), c)
			c.JSON(http.StatusBadRequest, models.ReportList{
				Exception: "GetReportList: Service Error: " + err.Error(),
			})
			return
		}
		sort.Sort(sort.Reverse(general.ByDBReports(rpts)))
		ans := &models.ReportList{}
		for _, rpt := range rpts {
			iRpt := models.ReportItem{
				ID:            rpt.ID,
				ReportType:    rptType.ReportType,
				ReportSubType: rpt.ReportSubType,
				ReportDate:    rpt.ReportDate,
			}
			ans.List = append(ans.List, iRpt)
		}
		c.JSON(http.StatusOK, ans)
	} else {
		types := make(map[string]general.ReportType)
		rptTypes, err := svcs.GetReportTypes()
		if err != nil {
			svcs.CreateDBLogEntry("GeneralAPI", "GetReportList", "ReportList Get Error", "",
				fmt.Sprintf("GetReportList: Service Error: %s", err.Error()), c)
			c.JSON(http.StatusBadRequest, models.ReportList{
				Exception: "GetReportList: Service Error: " + err.Error(),
			})
			return
		}
		for _, rType := range rptTypes {
			types[rType.ID.Hex()] = rType
		}
		rpts, err := svcs.GetReportsAll()
		if err != nil {
			svcs.CreateDBLogEntry("GeneralAPI", "GetReportList", "ReportList Get Error", "",
				fmt.Sprintf("GetReportList: Service Error: %s", err.Error()), c)
			c.JSON(http.StatusBadRequest, models.ReportList{
				Exception: "GetReportList: Service Error: " + err.Error(),
			})
			return
		}
		sort.Sort(sort.Reverse(general.ByDBReports(rpts)))
		ans := &models.ReportList{}
		for _, rpt := range rpts {
			rType := types[rpt.ReportTypeID.Hex()]
			iRpt := models.ReportItem{
				ID:            rpt.ID,
				ReportType:    rType.ReportType,
				ReportSubType: rpt.ReportSubType,
				ReportDate:    rpt.ReportDate,
			}
			ans.List = append(ans.List, iRpt)
		}
		c.JSON(http.StatusOK, ans)
	}
}
