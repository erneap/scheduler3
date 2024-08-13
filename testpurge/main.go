package main

import (
	"context"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/erneap/go-models/config"
	"github.com/erneap/go-models/employees"
	"go.mongodb.org/mongo-driver/bson"
)

func main() {
	// get the start and end dates for the purge from the parameters.
	args := os.Args
	if len(args) < 3 {
		fmt.Println("Usage: Must include start and stop dates in the form of YYYY-MM-DD")
		os.Exit(3)
	}
	start, err := time.ParseInLocation("2006-01-02", args[1], time.UTC)
	if err != nil {
		fmt.Println(err)
		os.Exit(3)
	}
	end, err := time.ParseInLocation("2006-01-02", args[2], time.UTC)
	if err != nil {
		fmt.Println(err)
		os.Exit(3)
	}

	// open the connection to the database
	config.ConnectDB()

	// get all the employee records from the database, then step through them
	// one at a time and set any leave during the period to approved rather than
	// actual, then write the employee's information back to the database.
	empCol := config.GetCollection(config.DB, "scheduler", "employees")
	filter := bson.M{}

	var emps []employees.Employee

	cursor, err := empCol.Find(context.TODO(), filter)
	if err != nil {
		fmt.Println(err)
		os.Exit(2)
	}

	if err = cursor.All(context.TODO(), &emps); err != nil {
		fmt.Println(err)
		os.Exit(2)
	}

	for _, emp := range emps {
		for l, lv := range emp.Leaves {
			if (lv.LeaveDate.Equal(start) || lv.LeaveDate.Equal(end) ||
				(lv.LeaveDate.After(start) && lv.LeaveDate.Before(end))) &&
				strings.EqualFold(lv.Status, "actual") {
				lv.Status = "APPROVED"
				emp.Leaves[l] = lv
			}
		}

		filter = bson.M{
			"_id": emp.ID,
		}
		_, err = empCol.ReplaceOne(context.TODO(), filter, emp)
		if err != nil {
			fmt.Println(err)
			os.Exit(2)
		}
	}

	// get all the employee work records from the database for the years, if start
	// and end years are different.  Then remove the work records for the period
	// and write the record back to the database.
	empWorkCol := config.GetCollection(config.DB, "scheduler", "employeework")
	filter = bson.M{
		"year": start.Year(),
	}

	var empWork []employees.EmployeeWorkRecord

	cursor, err = empWorkCol.Find(context.TODO(), filter)
	if err != nil {
		fmt.Println(err)
		os.Exit(2)
	}

	if err = cursor.All(context.TODO(), &empWork); err != nil {
		fmt.Println(err)
		os.Exit(2)
	}
	if start.Year() != end.Year() {
		filter = bson.M{
			"year": end.Year(),
		}
		var works2 []employees.EmployeeWorkRecord
		cursor, err = empWorkCol.Find(context.TODO(), filter)
		if err != nil {
			fmt.Println(err)
			os.Exit(2)
		}

		if err = cursor.All(context.TODO(), &works2); err != nil {
			fmt.Println(err)
			os.Exit(2)
		}
		if len(works2) > 0 {
			empWork = append(empWork, works2...)
		}
	}

	for _, workrec := range empWork {
		for w := len(workrec.Work) - 1; w >= 0; w-- {
			wk := workrec.Work[w]
			if wk.DateWorked.Equal(start) || wk.DateWorked.Equal(end) ||
				(wk.DateWorked.After(start) && wk.DateWorked.Before(end)) {
				workrec.Work = append(workrec.Work[:w], workrec.Work[w+1:]...)
			}
		}
		filter = bson.M{
			"_id": workrec.ID,
		}

		_, err = empWorkCol.ReplaceOne(context.TODO(), filter, workrec)
		if err != nil {
			fmt.Println(err)
			os.Exit(2)
		}
	}
}
