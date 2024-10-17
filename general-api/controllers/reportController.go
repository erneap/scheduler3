package controllers

import (
	"net/http"

	"github.com/erneap/go-models/svcs"
	"github.com/erneap/scheduler3/general-api/models"
	"github.com/gin-gonic/gin"
)

// This routine/function will provide the list of report types available
// for viewing
func GetReportTypes(c *gin.Context) {
	app := c.Param("app")
	rpts, err := svcs.GetReportsAll(app)
	if err != nil {
		ans := models.ReportList{Exception: err.Error()}
		c.JSON(http.StatusNotFound, ans)
		return
	}

	ans := models.ReportList{}
	for _, rpt := range rpts {
		found := false
		for _, item := range ans.List {
			if item.ReportType == rpt.ReportType {
				found = true
			}
		}
		if !found {
			newRpt := models.ReportItem{
				ReportType: rpt.ReportType,
			}
			ans.List = append(ans.List, newRpt)
		}
	}
	c.JSON(http.StatusOK, &ans)
}
