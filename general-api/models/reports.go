package models

import (
	"time"

	"github.com/erneap/go-models/general"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ReportTypeList struct {
	ReportTypes []general.ReportType `json:"reporttypes"`
	Exception   string               `json:"exception"`
}

type ReportItem struct {
	ID            primitive.ObjectID `json:"id"`
	ReportType    string             `json:"reporttype"`
	ReportSubType string             `json:"subtype,omitempty"`
	ReportDate    time.Time          `json:"reportdate"`
}

type ByReportItem []ReportItem

func (c ByReportItem) Len() int { return len(c) }
func (c ByReportItem) Less(i, j int) bool {
	if c[i].ReportDate.Equal(c[j].ReportDate) {
		if c[i].ReportType == c[j].ReportType {
			if c[i].ReportSubType != "" && c[j].ReportSubType != "" {
				return c[i].ReportSubType < c[j].ReportSubType
			}
		}
		return c[i].ReportType < c[j].ReportType
	}
	return c[i].ReportDate.Before(c[j].ReportDate)
}
func (c ByReportItem) Swap(i, j int) { c[i], c[j] = c[j], c[i] }

type ReportList struct {
	List      []ReportItem `json:"list"`
	Exception string       `json:"exception"`
}

type ReportListRequest struct {
	ReportTypes []string  `json:"reporttypes"`
	StartDate   time.Time `json:"start"`
	EndDate     time.Time `json:"end"`
}
