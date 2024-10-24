package models

import "github.com/erneap/go-models/general"

type LogApplicationList struct {
	List      []string `json:"list"`
	Exception string   `json:"exception"`
}

type LogList struct {
	List      []general.LogEntry `json:"list"`
	Exception string             `json:"exception"`
}
