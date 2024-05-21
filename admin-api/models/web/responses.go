package web

import (
	"github.com/erneap/go-models/employees"
	"github.com/erneap/go-models/logs"
	"github.com/erneap/go-models/notifications"
	"github.com/erneap/go-models/sites"
	"github.com/erneap/go-models/teams"
	"github.com/erneap/go-models/users"
)

type EmployeeResponse struct {
	Employee     *employees.Employee     `json:"employee,omitempty"`
	LeaveRequest *employees.LeaveRequest `json:"leaverequest,omitempty"`
	Exception    string                  `json:"exception"`
}

type InitialResponse struct {
	Team      *teams.Team         `json:"team,omitempty"`
	Site      *sites.Site         `json:"site,omitempty"`
	Employee  *employees.Employee `json:"employee,omitempty"`
	Exception string              `json:"exception"`
}

type SiteResponse struct {
	Team      *teams.Team `json:"team,omitempty"`
	Site      *sites.Site `json:"site,omitempty"`
	Exception string      `json:"exception"`
}

type IngestResponse struct {
	Employees  []employees.Employee `json:"employees"`
	IngestType string               `json:"ingest"`
	Exception  string               `json:"exception"`
}

type UsersResponse struct {
	Users     []users.User `json:"users"`
	Exception string       `json:"exception"`
}

type TeamsResponse struct {
	Teams     []teams.Team `json:"teams,omitempty"`
	Exception string       `json:"exception"`
}

type NotificationResponse struct {
	Messages  []notifications.Notification `json:"messages,omitempty"`
	Exception string                       `json:"exception"`
}

type LogResponse struct {
	Entries   []logs.LogEntry2 `json:"entries"`
	Exception string           `json:"exception"`
}

type EmployeeWorkResponse struct {
	EmployeeID   string           `json:"id,omitempty"`
	Year         int              `json:"year,omitempty"`
	EmployeeWork []employees.Work `json:"work,omitempty"`
	Exception    string           `json:"exception"`
}

type SiteWorkResponse struct {
	TeamID    string                 `json:"team,omitempty"`
	SiteID    string                 `json:"site,omitempty"`
	Year      int                    `json:"year,omitempty"`
	Work      []EmployeeWorkResponse `json:"employees,omitempty"`
	Exception string                 `json:"exception"`
}
