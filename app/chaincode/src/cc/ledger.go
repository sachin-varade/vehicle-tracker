/*
Licensed to the Apache Software Foundation (ASF) under one
or more contributor license agreements.  See the NOTICE file
distributed with this work for additional information
regarding copyright ownership.  The ASF licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
*/
package main

import (
	"fmt"
	"encoding/json"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

// ============================================================================================================================
// Main
// ============================================================================================================================
func main() {
	err := shim.Start(new(SimpleChaincode))
	if err != nil {
		fmt.Printf("Error starting Simple chaincode - %s", err)
	}
}

// Vehicle tracker start

// SimpleChaincode example simple Chaincode implementation
type SimpleChaincode struct {
}

//VehicleId, Description, RegistrationNumber, Make, VIN, DateofRegistration, ChassisNumber, Color, OwnerName, OwnerPhoneNumber, OwnerEmail
type Vehicle struct {
	VehicleId 			string 	`json:"vehicleId"`
	Make 		string  `json:"make"`
	Variant 		string  `json:"variant"`
	Engine 		string  `json:"engine"`
	GearBox 		string  `json:"gearBox"`
	Color 		string  `json:"color"`
	Image 		string  `json:"image"`
	ChassisNumber 		string  `json:"chassisNumber"`
	Vin 		string  `json:"vin"`
	DateOfManufacture 		string  `json:"dateOfManufacture"`	
	Owner Owner `json:"owner"`
	Dealer Dealer `json:"dealer"`
	LicensePlateNumber 		string  `json:"licensePlateNumber"`
	WarrantyStartDate 		string  `json:"warrantyStartDate"`	
	WarrantyEndDate 		string  `json:"warrantyEndDate"`	
	DateofDelivery 		string  `json:"dateofDelivery"`
	ServiceRequestRaised	string 	`json:"serviceRequestRaised"`	
	Parts		[]Part `json:"parts"`
	VehicleTransactions		[]VehicleTransaction `json:"vehicleTransactions"`
	VehicleService		[]VehicleService `json:"vehicleService"`
}

type VehicleService struct {	
	ServiceDescription		string  `json:"serviceDescription"`
	Parts		[]Part `json:"parts"`
	ServiceDoneBy  			string  `json:"serviceDoneBy"`
	ServiceDoneOn  			string  `json:"serviceDoneOn"`
}

type VehicleTransaction struct {	
	WarrantyStartDate 		string  `json:"warrantyStartDate"`	
	WarrantyEndDate 		string  `json:"warrantyEndDate"`	
	TType 			string   `json:"ttype"`
	TValue 			string   `json:"tvalue"`
	UpdatedBy  			string  `json:"updatedBy"`
	UpdatedOn  			string  `json:"updatedOn"`
}

type Owner struct {
	Name 		string  `json:"name"`
	PhoneNumber 		string  `json:"phoneNumber"`
	Email 		string  `json:"email"`
}

type Dealer struct {
	Name 		string  `json:"name"`
	PhoneNumber 		string  `json:"phoneNumber"`
	Email 		string  `json:"email"`
}

type Part struct {
	PartId 			string 	`json:"partId"`
	ProductCode 		string  `json:"productCode"`
	PartCode 		string  `json:"partCode"`
	PartType 		string  `json:"partType"`
	PartName 		string  `json:"partName"`
	Transactions		[]Transaction `json:"transactions"`
}

// PART TRANSACTION HISTORY
type Transaction struct {
	User  			string  `json:"user"`
	DateOfManufacture	string  `json:"dateOfManufacture"`
	DateOfDelivery		string	`json:"dateOfDelivery"`
	DateOfInstallation	string	`json:"dateOfInstallation"`
	VehicleId		string	`json:"vehicleId"`
	WarrantyStartDate	string	`json:"warrantyStartDate"`
	WarrantyEndDate		string	`json:"warrantyEndDate"`
	TType 			string   `json:"ttype"`
}

//==============================================================================================================================
//				Used as an index when querying all vehicles and parts.
//==============================================================================================================================

type AllVehicles struct{
	Vehicles []string `json:"vehicles"`
}

type AllVehicleDetails struct{
	Vehicles []Vehicle `json:"vehicles"`
}


type AllParts struct{
	Parts []string `json:"parts"`
}

// Vehicle tracker end

// ============================================================================================================================
// Init - initialize the chaincode 
//
// Shows off PutState() and how to pass an input argument to chaincode.
//
// Inputs - Array of strings
//  ["314"]
// 
// Returns - shim.Success or error
// ============================================================================================================================
func (t *SimpleChaincode) Init(stub shim.ChaincodeStubInterface) pb.Response {
	fmt.Println("App Is Starting Up")
	_, args := stub.GetFunctionAndParameters()
	var err error
	
	fmt.Println("Init() args count:", len(args))
	fmt.Println("Init() args found:", args)

	// expecting 1 arg for instantiate or upgrade
	if len(args) == 1 {
		fmt.Println("Init() arg[0] length", len(args[0]))

		// expecting arg[0] to be length 0 for upgrade
		if len(args[0]) == 0 {
			fmt.Println("args[0] is empty... must be upgrading")
		} else {
			fmt.Println("args[0] is not empty, must be instantiating")
		}
	}

	// Vehicle Tracker start
	var vehicles AllVehicles
	var parts AllParts

	jsonAsBytesVehicles, _ := json.Marshal(vehicles)
	err = stub.PutState("allVehicles", jsonAsBytesVehicles)
	if err != nil {
		//return nil, err
		return shim.Error(err.Error())
	}

	jsonAsBytesParts, _ := json.Marshal(parts)
	err = stub.PutState("allParts", jsonAsBytesParts)
	if err != nil {
		//return nil, err
		return shim.Error(err.Error())
	}

	// Vehicle tracker end

	fmt.Println("ready for action")                          //self-test pass
	return shim.Success(nil)
}


// ============================================================================================================================
// Invoke - Our entry point for Invocations
// ============================================================================================================================
func (t *SimpleChaincode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	function, args := stub.GetFunctionAndParameters()
	fmt.Println(" ")
	fmt.Println("starting invoke, for - " + function)

	// Handle different functions
	if function == "init" {                    //initialize the chaincode state, used as reset
		return t.Init(stub)
	} else if function == "read" {             //generic read ledger
		return read(stub, args)
	} else if function == "getPart" { 
		return getPart(stub, args[0])
	} else if function == "getAllParts" { 
		return getAllParts(stub, args[0])
	} else if function == "createPart" {			//create a part
		return createPart(stub, args)	
	} else if function == "updatePart" {			//create a part
		return updatePart(stub, args)	
	} else if function == "getVehicle" { 
		return getVehicle(stub, args[0]) 
	} else if function == "getVehicleByVIN" { 
		return getVehicleByVIN(stub, args[0]) 
	} else if function == "getVehicleByChassisNumber" { 
		return getVehicleByChassisNumber(stub, args[0]) 
	} else if function == "getAllVehicles" { 
		return getAllVehicles(stub, args[0]) 
	} else if function == "createVehicle" {			//create a vehicle
		return createVehicle(stub, args)	
	} else if function == "updateVehicle" {			//create a vehicle
		return updateVehicle(stub, args)	
	}

	// error out
	fmt.Println("Received unknown invoke function name - " + function)
	return shim.Error("Received unknown invoke function name - '" + function + "'")
}

// ============================================================================================================================
// Query - legacy function
// ============================================================================================================================
func (t *SimpleChaincode) Query(stub shim.ChaincodeStubInterface) pb.Response {
	return shim.Error("Unknown supported call - Query()")
}