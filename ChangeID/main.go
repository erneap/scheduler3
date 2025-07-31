package main

import (
	"context"
	"fmt"
	"log"

	"github.com/erneap/go-models/v2/employees"
	"github.com/erneap/go-models/v2/svcs"
	"github.com/erneap/models/v2/config"
	"go.mongodb.org/mongo-driver/bson"
)

func main() {
	fmt.Println("Starting")

	// run database
	config.ConnectDB()

	// to change a person's primary key,
	// I must pull their employee record
	// oldid = 68107f948a5f27b2e7cb8f60
	email := "marcus.harkins.1.ctr@us.af.mil"

	// then add it with the new id.
	user, err := svcs.GetUserByEMail(email)
	if err != nil {
		log.Fatalln(err)
	}

	// get old employee record
	empCol := config.GetCollection(config.DB, "scheduler", "employees")
	filter := bson.M{
		"email": email,
	}
	var emp employees.Employee
	err = empCol.FindOne(context.TODO(), filter).Decode(&emp)
	if err != nil {
		log.Fatalln(err)
	}

	// Add scheduler-employee to user workgroups
	if !user.IsInGroup("scheduler", "employee") {
		user.Workgroups = append(user.Workgroups, "scheduler-employee")
	}
	err = svcs.UpdateUser(*user)
	if err != nil {
		log.Fatalln(err)
	}
	oldKey := emp.ID

	// insert the new employee record
	emp.ID = user.ID
	_, err = empCol.InsertOne(context.TODO(), emp)
	if err != nil {
		log.Fatalln(err)
	}

	// delete old employee by id
	filter = bson.M{
		"_id": oldKey,
	}
	_, err = empCol.DeleteOne(context.TODO(), filter)
	if err != nil {
		log.Fatalln(err)
	}

	// change reference employee id from old key to new key
	workCol := config.GetCollection(config.DB, "scheduler", "employeework")

	filter = bson.M{
		"employeeID": oldKey,
	}

	var work []employees.EmployeeWorkRecord
	cursor, err := workCol.Find(context.TODO(), filter)
	if err != nil {
		log.Fatalln(err)
	}
	if err = cursor.All(context.TODO(), &work); err != nil {
		log.Fatalln(err)
	}
	for _, wk := range work {
		wk.EmployeeID = user.ID
		filter = bson.M{
			"_id": wk.ID,
		}
		_, err = workCol.ReplaceOne(context.TODO(), filter, wk)
		if err != nil {
			log.Println(err)
		}
	}
}
