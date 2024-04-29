package ingest

import "time"

type ExcelRow struct {
	Date         time.Time
	CompanyID    string
	Preminum     string
	ChargeNumber string
	Extension    string
	Code         string
	Modified     bool
	Hours        float64
}

type ByExcelRow []ExcelRow

func (c ByExcelRow) Len() int { return len(c) }
func (c ByExcelRow) Less(i, j int) bool {
	if c[i].CompanyID == c[j].CompanyID {
		if c[i].Date.Equal(c[j].Date) {
			return c[i].Hours == c[j].Hours
		}
		return c[i].Date.Before(c[j].Date)
	}
	return c[i].CompanyID < c[j].CompanyID
}
func (c ByExcelRow) Swap(i, j int) { c[i], c[j] = c[j], c[i] }
