package main

import (
	"context"
	"fmt"
	"log"

	"github.com/erneap/go-models/v2/svcs"
	"github.com/erneap/go-models/v2/users"
	"github.com/erneap/models/v2/config"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func main() {
	fmt.Println("Starting")

	// run database
	config.ConnectDB()

	// to change a person's primary key,
	// I must pull their employee record
	// oldid = 68107f948a5f27b2e7cb8f60
	email := "fred.m.yelinek@rtx.com"
	id := "6847a682a420d89795769e31"

	// then add it with the new id.
	emp, err := svcs.GetEmployee(id)
	if err != nil {
		log.Fatalln(err)
	}

	// get old employee record
	userID, _ := primitive.ObjectIDFromHex(id)
	user := users.User{
		ID:           userID,
		EmailAddress: email,
		LastName:     emp.Name.LastName,
		FirstName:    emp.Name.FirstName,
		MiddleName:   emp.Name.MiddleName,
	}
	user.SetPassword("zaq1!QAZzaq1!QAZ")
	user.Workgroups = append(user.Workgroups, "metrics-GEOINT")
	user.Workgroups = append(user.Workgroups, "scheduler-employee")

	userCol := config.GetCollection(config.DB, "authenticate", "users")
	userCol.InsertOne(context.TODO(), user)
}
