package main

import (
	"context"
	"fmt"
	"log"

	"github.com/erneap/models/v2/config"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func main() {
	fmt.Println("Starting")

	// run database
	config.ConnectDB()

	// to change a person's primary key,
	// I must pull their employee record
	pKey, err := primitive.ObjectIDFromHex("68107f948a5f27b2e7cb8f60")
	if err != nil {
		log.Fatalf("New Key: %s\n", err.Error())
	}
	oldKey, err := primitive.ObjectIDFromHex("63aa10da17a70c70cebb76a9")
	if err != nil {
		log.Fatalf("Old Key: %s\n", err.Error())
	}

	// then add it with the new id.
	emp.ID = pKey
	empCol := config.GetCollection(config.DB, "scheduler", "employees")

	empCol.InsertOne(context.TODO(), emp)

}
