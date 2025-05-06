package models

import "github.com/erneap/models/v2/general"

type LogApplicationList struct {
	List      []string `json:"list"`
	Exception string   `json:"exception"`
}

type LogList struct {
	List      []general.LogEntry `json:"list"`
	Exception string             `json:"exception"`
}
