package web

import (
	"time"

	"github.com/erneap/go-models/employees"
	"github.com/erneap/go-models/users"
)

type MessageRequest struct {
	UserID  string `json:"userid,omitempty"`
	To      string `json:"to"`
	From    string `json:"from"`
	Message string `json:"message"`
}

type NotificationAck struct {
	Messages []string `json:"messages"`
}

type NewEmployeeRequest struct {
	TeamID   string             `json:"team"`
	SiteID   string             `json:"site"`
	Employee employees.Employee `json:"employee"`
	Password string             `json:"password"`
}

type NewEmployeeAssignment struct {
	EmployeeID   string    `json:"employee"`
	SiteID       string    `json:"site"`
	Workcenter   string    `json:"workcenter"`
	StartDate    time.Time `json:"start"`
	ScheduleDays int       `json:"scheduledays"`
}

type ChangeAssignmentRequest struct {
	EmployeeID   string `json:"employee"`
	AssignmentID uint   `json:"asgmt"`
	ScheduleID   uint   `json:"schedule,omitempty"`
	WorkdayID    uint   `json:"workday,omitempty"`
	Field        string `json:"field"`
	Value        string `json:"value"`
}

type NewEmployeeVariation struct {
	EmployeeID string              `json:"employee"`
	Variation  employees.Variation `json:"variation"`
}

type LeaveBalanceRequest struct {
	EmployeeID  string  `json:"employee"`
	Year        int     `json:"year"`
	AnnualLeave float64 `json:"annual,omitempty"`
	CarryOver   float64 `json:"carryover,omitempty"`
}

type EmployeeLeaveRequest struct {
	EmployeeID string    `json:"employee"`
	Code       string    `json:"code"`
	StartDate  time.Time `json:"startdate"`
	EndDate    time.Time `json:"enddate"`
}

type EmployeeLaborCodeRequest struct {
	EmployeeID   string `json:"employee"`
	AssginmentID int    `json:"assignment"`
	ChargeNumber string `json:"chargeNumber"`
	Extension    string `json:"extension"`
}

type EmployeeLeaveDayRequest struct {
	EmployeeID string             `json:"employee"`
	Leave      employees.LeaveDay `json:"leave"`
}

type EmployeeContactUpdate struct {
	EmployeeID string `json:"employee"`
	TypeID     int    `json:"typeid"`
	ContactID  int    `json:"contactid"`
	Value      string `json:"value"`
}

type EmployeeSpecialtyUpdate struct {
	EmployeeID  string `json:"employee"`
	TypeID      int    `json:"typeid"`
	SpecialtyID int    `json:"specialtyid"`
	Value       bool   `json:"value"`
}

type EmployeeSpecialtiesUpdate struct {
	EmployeeID  string `json:"employee"`
	Action      string `json:"action"`
	Specialties []int  `json:"specialties"`
}

type NewSiteRequest struct {
	TeamID    string      `json:"team"`
	SiteID    string      `json:"siteid"`
	Name      string      `json:"name"`
	UseMids   bool        `json:"mids"`
	Offset    float64     `json:"offset"`
	Leader    *users.User `json:"lead"`
	Scheduler *users.User `json:"scheduler,omitempty"`
}

type CreateEmployeeLeaveBalances struct {
	TeamID string `json:"team"`
	SiteID string `json:"siteid"`
	Year   int    `json:"year"`
}

type NewSiteWorkcenter struct {
	TeamID  string `json:"team"`
	SiteID  string `json:"siteid"`
	WkctrID string `json:"wkctrid"`
	Name    string `json:"name"`
}

type SiteWorkcenterUpdate struct {
	TeamID  string `json:"team"`
	SiteID  string `json:"siteid"`
	WkctrID string `json:"wkctrid"`
	Field   string `json:"field"`
	Value   string `json:"value"`
}

type NewWorkcenterPosition struct {
	TeamID     string `json:"team"`
	SiteID     string `json:"siteid"`
	WkctrID    string `json:"wkctrid"`
	PositionID string `json:"positionid"`
	Name       string `json:"name"`
}

type WorkcenterPositionUpdate struct {
	TeamID     string `json:"team"`
	SiteID     string `json:"siteid"`
	WkctrID    string `json:"wkctrid"`
	PositionID string `json:"positionid"`
	Field      string `json:"field"`
	Value      string `json:"value"`
}

type NewSiteLaborCode struct {
	TeamID           string `json:"team"`
	SiteID           string `json:"siteid"`
	ReportID         int    `json:"reportid"`
	ChargeNumber     string `json:"chargeNumber"`
	Extension        string `json:"extension"`
	CLIN             string `json:"clin,omitempty"`
	SLIN             string `json:"slin,omitempty"`
	Location         string `json:"location,omitempty"`
	WBS              string `json:"wbs,omitempty"`
	MinimumEmployees string `json:"minimumEmployees,omitempty"`
	NotAssignedName  string `json:"notAssignedName,omitempty"`
	HoursPerEmployee string `json:"hoursPerEmployee,omitempty"`
	Exercise         string `json:"exercise,omitempty"`
	StartDate        string `json:"startDate,omitempty"`
	EndDate          string `json:"endDate,omitempty"`
}

type UpdateSiteLaborCode struct {
	TeamID       string `json:"team"`
	SiteID       string `json:"siteid"`
	ReportID     int    `json:"reportid"`
	ChargeNumber string `json:"chargeNumber"`
	Extension    string `json:"extension"`
	Field        string `json:"field"`
	Value        string `json:"value"`
}

type CreateSiteForecast struct {
	TeamID    string    `json:"team"`
	SiteID    string    `json:"siteid"`
	CompanyID string    `json:"companyid"`
	Name      string    `json:"name"`
	StartDate time.Time `json:"startdate"`
	EndDate   time.Time `json:"enddate"`
	Period    int       `json:"period"`
}

type UpdateSiteForecast struct {
	TeamID   string `json:"team"`
	SiteID   string `json:"siteid"`
	ReportID int    `json:"reportid"`
	Field    string `json:"field"`
	Value    string `json:"value"`
}

type CreateTeamRequest struct {
	Name            string     `json:"name"`
	UseStdWorkcodes bool       `json:"useStdWorkcodes"`
	Leader          users.User `json:"leader"`
}

type UpdateTeamRequest struct {
	TeamID       string `json:"teamid"`
	AdditionalID string `json:"additionalid,omitempty"`
	HolidayID    string `json:"holiday,omitempty"`
	Field        string `json:"field,omitempty"`
	Value        string `json:"value"`
}

type CreateTeamWorkcodeRequest struct {
	TeamID    string `json:"teamid"`
	Id        string `json:"id"`
	Title     string `json:"title"`
	StartTime uint64 `json:"start"`
	ShiftCode string `json:"shiftCode"`
	AltCode   string `json:"altcode"`
	IsLeave   bool   `json:"isLeave"`
	TextColor string `json:"textcolor"`
	BackColor string `json:"backcolor"`
}

type CreateTeamCompany struct {
	TeamID     string `json:"teamid"`
	ID         string `json:"id"`
	Name       string `json:"name"`
	IngestType string `json:"ingest"`
}

type CreateCompanyHoliday struct {
	TeamID    string `json:"teamid"`
	CompanyID string `json:"companyid"`
	HolidayID string `json:"holidayid"`
	Name      string `json:"name"`
	Actual    string `json:"actual,omitempty"`
}

type IngestChange struct {
	EmployeeID string              `json:"employeeid"`
	ChangeType string              `json:"changetype"`
	Work       *employees.Work     `json:"work,omitempty"`
	Leave      *employees.LeaveDay `json:"leave,omitempty"`
}

type ManualIngestChanges struct {
	TeamID    string         `json:"teamid"`
	SiteID    string         `json:"siteid"`
	CompanyID string         `json:"companyid"`
	Changes   []IngestChange `json:"changes"`
}

type ReportRequest struct {
	ReportType string `json:"reportType"`
	Period     string `json:"period,omitempty"`
	SubReport  string `json:"subreport,omitempty"`
	TeamID     string `json:"teamid"`
	SiteID     string `json:"siteid"`
	CompanyID  string `json:"companyid,omitempty"`
	Password   string `json:"password,omitempty"`
}

type NewCofSReport struct {
	TeamID    string    `json:"teamid"`
	SiteID    string    `json:"siteid"`
	Name      string    `json:"rptname"`
	Unit      string    `json:"unit"`
	ShortName string    `json:"shortname"`
	StartDate time.Time `json:"startdate"`
	EndDate   time.Time `json:"enddate"`
}

type UpdateCofSReport struct {
	TeamID    string `json:"teamid"`
	SiteID    string `json:"siteid"`
	ReportID  int    `json:"rptid"`
	CompanyID string `json:"companyid,omitempty"`
	Field     string `json:"field"`
	Value     string `json:"value"`
}

type AddLogEntry struct {
	Portion  string `json:"portion"`
	Category string `json:"category"`
	Title    string `json:"title"`
	Message  string `json:"message"`
}

type AddType struct {
	TeamID string `json:"teamid"`
	ID     int    `json:"id"`
	Name   string `json:"name"`
}

type UpdateType struct {
	TeamID string `json:"teamid"`
	ID     int    `json:"id"`
	Field  string `json:"field"`
	Value  string `json:"value"`
}

type QueryRequest struct {
	TeamID      string `json:"teamid"`
	NextHours   int    `json:"hours"`
	Specialties []int  `json:"specialties"`
}
