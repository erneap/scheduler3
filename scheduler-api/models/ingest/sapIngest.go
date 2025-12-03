package ingest

import (
	"log"
	"mime/multipart"
	"regexp"
	"strings"
	"time"

	"github.com/erneap/models/v2/converters"
	"github.com/erneap/models/v2/svcs"
	"github.com/xuri/excelize/v2"
)

type SAPIngest struct {
	Files  []*multipart.FileHeader
	TeamID string
}

func (s *SAPIngest) Process() ([]ExcelRow, time.Time,
	time.Time) {
	start := time.Now()
	end := time.Date(1970, 1, 1, 0, 0, 0, 0, time.UTC)
	var records []ExcelRow
	for _, file := range s.Files {
		recs, fStart, fEnd := s.ProcessFile(file)
		records = append(records, recs...)
		if fStart.Before(start) {
			start = fStart
		}
		if fEnd.After(end) {
			end = fEnd
		}
	}
	return records, start, end
}

func (s *SAPIngest) ProcessFile(file *multipart.FileHeader) ([]ExcelRow,
	time.Time, time.Time) {
	readerFile, _ := file.Open()
	f, err := excelize.OpenReader(readerFile)
	if err != nil {
		log.Println(err)
	}
	sheetName := f.GetSheetName(0)

	columns := make(map[string]int)

	team, _ := svcs.GetTeam(s.TeamID)

	rows, err := f.GetRows(sheetName)
	if err != nil {
		log.Println(err)
	}
	startDate := time.Now()
	endDate := time.Date(1970, 1, 1, 0, 0, 0, 0, time.UTC)
	var records []ExcelRow
	for i, row := range rows {
		if i == 0 {
			for j, colCell := range row {
				columns[strings.ToLower(colCell)] = j
			}
		} else {
			explanation := row[columns["explanation"]]
			description := row[columns["charge number desc"]]
			if !strings.Contains(explanation, "Total") {
				date := converters.ParseDate(row[columns["date"]])
				if date.Before(startDate) {
					startDate = time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0,
						0, time.UTC)
				}
				if date.After(endDate) {
					endDate = time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0,
						0, time.UTC)
				}
				companyID := row[columns["personnel no."]]
				chargeNo := strings.TrimSpace(row[columns["charge number"]])
				premimum := strings.TrimSpace(row[columns["prem. no."]])
				extension := strings.TrimSpace(row[columns["ext."]])
				hours := converters.ParseFloat(row[columns["hours"]])
				// check to see if ingest row is for a leave type record
				bLeave := false
				if team != nil {
					for _, wc := range team.Workcodes {
						if wc.IsLeave {
							if strings.Contains(strings.ToLower(description),
								strings.ToLower(wc.Search)) {
								code := wc.Id
								record := ExcelRow{
									Date:      date,
									CompanyID: companyID,
									Code:      code,
									Hours:     hours,
								}
								if strings.EqualFold(code, "h") {
									pattern := "[hf][0-9]{1,2}"
									re := regexp.MustCompile(pattern)
									if len(explanation) > 1 {
										index := re.FindStringIndex(strings.ToLower(explanation))
										if index != nil {
											record.HolidayID = explanation[index[0]:index[1]]
										}
									}
								}
								records = append(records, record)
								bLeave = true
							}
						}
					}
				}
				if !bLeave {
					found := false
					for r, record := range records {
						if record.Date.Equal(date) && companyID == record.CompanyID &&
							record.Preminum == premimum && record.ChargeNumber == chargeNo &&
							record.Extension == extension {
							found = true
							hrs := record.Hours + hours
							records[r].Hours = hrs
						}
					}
					if !found {
						record := ExcelRow{
							Date:         date,
							CompanyID:    companyID,
							Preminum:     premimum,
							ChargeNumber: chargeNo,
							Extension:    extension,
							Modified:     strings.Contains(strings.ToLower(description), "modified"),
							Hours:        hours,
						}
						records = append(records, record)
					}
				}
			}
		}
	}
	return records, startDate, endDate
}
