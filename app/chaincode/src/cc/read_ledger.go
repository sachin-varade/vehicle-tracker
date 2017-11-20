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
	"encoding/json"
	"fmt"
	"strings"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

// ============================================================================================================================
// Read - read a generic variable from ledger
//
// Shows Off GetState() - reading a key/value from the ledger
//
// Inputs - Array of strings
//  0
//  key
//  "abc"
// 
// Returns - string
// ============================================================================================================================
func read(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var key, jsonResp string
	var err error
	fmt.Println("starting read")

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting key of the var to query")
	}

	// input sanitation
	err = sanitize_arguments(args)
	if err != nil {
		return shim.Error(err.Error())
	}

	key = args[0]
	valAsbytes, err := stub.GetState(key)           //get the var from ledger
	if err != nil {
		jsonResp = "{\"Error\":\"Failed to get state for " + key + "\"}"
		return shim.Error(jsonResp)
	}

	fmt.Println("- end read")
	return shim.Success(valAsbytes)                  //send it onward
}

// ============================================================================================================================
// Get Part Details
// ============================================================================================================================
func getPart(stub shim.ChaincodeStubInterface, partId string) pb.Response {
	fmt.Println("Start find Part")
	fmt.Println("Looking for Part #" + partId);

	//get the part index
	bAsBytes, err := stub.GetState(partId)
	if err != nil {
		return shim.Error("Failed to get Part #" + partId)
	}
	return shim.Success(bAsBytes)
}
		
// ============================================================================================================================
// Get All Parts
// ============================================================================================================================
func getAllParts(stub  shim.ChaincodeStubInterface, user string) pb.Response {
	fmt.Println("getAllParts:Looking for All Parts");

	//get the AllParts index
	allBAsBytes, err := stub.GetState("allParts")
	if err != nil {
		return shim.Error("Failed to get all Parts")
	}

	var res AllParts
	err = json.Unmarshal(allBAsBytes, &res)
	//fmt.Println(allBAsBytes);
	if err != nil {
		fmt.Println("Printing Unmarshal error:-");
		fmt.Println(err);
		return shim.Error("Failed to Unmarshal all Parts")
	}

	var rab AllParts

	for i := range res.Parts{

		sbAsBytes, err := stub.GetState(res.Parts[i])
		if err != nil {
			return shim.Error("Failed to get Part")
		}
		var sb Part
		json.Unmarshal(sbAsBytes, &sb)

		// currently we show all parts to the users
		rab.Parts = append(rab.Parts,sb.PartId);
	}

	rabAsBytes, _ := json.Marshal(rab)

	return shim.Success(rabAsBytes)
}

// ============================================================================================================================
// Get Vehicle Details
// ============================================================================================================================
func getVehicle(stub shim.ChaincodeStubInterface, vehicleId string) pb.Response {
	fmt.Println("Start find Vehicle")
	fmt.Println("Looking for Vehicle #" + vehicleId);

	//get the vehicle index
	bAsBytes, err := stub.GetState(vehicleId)
	if err != nil {
		return shim.Error("Failed to get Vehicle Id #" + vehicleId)
	}

	///return bAsBytes, nil
	return shim.Success(bAsBytes)
}

// ============================================================================================================================
// Get Vehicle by VIN number
// ============================================================================================================================
func getVehicleByVIN(stub  shim.ChaincodeStubInterface, inVIN string) pb.Response {
	fmt.Println("getAllVehicles:Looking for vehicle by vin number");

	//get the AllVehicles index
	allBAsBytes, err := stub.GetState("allVehicles")
	if err != nil {
		return shim.Error("Failed to get all Vehicles")
	}

	var res AllVehicles
	err = json.Unmarshal(allBAsBytes, &res)
	//fmt.Println(allBAsBytes);
	if err != nil {
		fmt.Println("Printing Unmarshal error:-");
		fmt.Println(err);
		return shim.Error("Failed to Unmarshal all Vehicles")
	}

	var cvehicle Vehicle
	for i := range res.Vehicles{

		sbAsBytes, err := stub.GetState(res.Vehicles[i])
		if err != nil {
			return shim.Error("Failed to get Vehicle")
		}
		var sb Vehicle
		json.Unmarshal(sbAsBytes, &sb)
		
		if strings.ToLower(sb.Vin) == strings.ToLower(inVIN) {
			cvehicle = sb
		}
	}

	rabAsBytes, _ := json.Marshal(cvehicle)

	return shim.Success(rabAsBytes)
}

// ============================================================================================================================
// Get Vehicle by chassis number
// ============================================================================================================================
func getVehicleByChassisNumber(stub  shim.ChaincodeStubInterface, inChassisNumber string) pb.Response {	
	fmt.Println("getAllVehicles:Looking for vehicle by chassid number");

	//get the AllVehicles index
	allBAsBytes, err := stub.GetState("allVehicles")
	if err != nil {
		return shim.Error("Failed to get all Vehicles")
	}

	var res AllVehicles
	err = json.Unmarshal(allBAsBytes, &res)
	//fmt.Println(allBAsBytes);
	if err != nil {
		fmt.Println("Printing Unmarshal error:-");
		fmt.Println(err);
		return shim.Error("Failed to Unmarshal all Vehicles")
	}

	var cvehicle Vehicle
	for i := range res.Vehicles{

		sbAsBytes, err := stub.GetState(res.Vehicles[i])
		if err != nil {
			return shim.Error("Failed to get Vehicle")
		}
		var sb Vehicle
		json.Unmarshal(sbAsBytes, &sb)
		
		if strings.ToLower(sb.ChassisNumber) == strings.ToLower(inChassisNumber) {
			cvehicle = sb
		}
	}

	rabAsBytes, _ := json.Marshal(cvehicle)

	return shim.Success(rabAsBytes)
}

// ============================================================================================================================
// Get All Vehicles
// ============================================================================================================================
func getAllVehicles(stub shim.ChaincodeStubInterface, user string) pb.Response {	
	
	fmt.Println("getAllVehicles:Looking for All Vehicles");

	//get the AllVehicles index
	allBAsBytes, err := stub.GetState("allVehicles")
	if err != nil {
		//return nil, errors.New("Failed to get all Vehicles")
		return shim.Error(err.Error())
	}

	var res AllVehicles
	err = json.Unmarshal(allBAsBytes, &res)
	//fmt.Println(allBAsBytes);
	if err != nil {
		fmt.Println("Printing Unmarshal error:-");
		fmt.Println(err);
		//return nil, errors.New("Failed to Unmarshal all Vehicles")
		return shim.Error(err.Error())
	}

	var rab AllVehicles

	for i := range res.Vehicles{

		sbAsBytes, err := stub.GetState(res.Vehicles[i])
		if err != nil {
			//return nil, errors.New("Failed to get Vehicle")
			return shim.Error(err.Error())
		}
		var sb Vehicle
		json.Unmarshal(sbAsBytes, &sb)
		
		if user != "" {
			// return only customer vehicles
			if sb.Owner.Name == user {
				rab.Vehicles = append(rab.Vehicles, sb.VehicleId +"-"+ sb.ChassisNumber +"-"+ sb.LicensePlateNumber);
			} else if sb.Dealer.Name == user {
				rab.Vehicles = append(rab.Vehicles, sb.VehicleId +"-"+ sb.ChassisNumber +"-"+ sb.LicensePlateNumber);
			}
		} else if user == "" {
			// return all vehicles for mfr, dealer, service center user
			rab.Vehicles = append(rab.Vehicles, sb.VehicleId +"-"+ sb.ChassisNumber +"-"+ sb.LicensePlateNumber);
		}
	}

	rabAsBytes, _ := json.Marshal(rab)

	///return rabAsBytes, nil
	return shim.Success(rabAsBytes)
}


// ============================================================================================================================
// Get All Vehicles
// ============================================================================================================================
func getAllVehicleDetails(stub shim.ChaincodeStubInterface, filter string, filterValue string) pb.Response {	
	
	fmt.Println("getAllVehicles:Looking for All Vehicles");

	//get the AllVehicles index
	allBAsBytes, err := stub.GetState("allVehicles")
	if err != nil {
		//return nil, errors.New("Failed to get all Vehicles")
		return shim.Error(err.Error())
	}

	var res AllVehicles
	err = json.Unmarshal(allBAsBytes, &res)
	//fmt.Println(allBAsBytes);
	if err != nil {
		fmt.Println("Printing Unmarshal error:-");
		fmt.Println(err);
		//return nil, errors.New("Failed to Unmarshal all Vehicles")
		return shim.Error(err.Error())
	}

	var rab AllVehicleDetails

	for i := range res.Vehicles{

		sbAsBytes, err := stub.GetState(res.Vehicles[i])
		if err != nil {
			//return nil, errors.New("Failed to get Vehicle")
			return shim.Error(err.Error())
		}
		var sb Vehicle
		json.Unmarshal(sbAsBytes, &sb)
			
		if strings.ToLower(filter) == "vin" && strings.ToLower(filterValue) != ""{
		// all vehicles linked with vin
			if strings.ToLower(sb.Vin) == strings.ToLower(filterValue) {
				rab.Vehicles = append(rab.Vehicles, sb);
			}
		} else if strings.ToLower(filter) == "user" && strings.ToLower(filterValue) == "all"{
		// all vehicles linked with customers
			if sb.Owner.Name != "" {
				rab.Vehicles = append(rab.Vehicles, sb);
			}
		} else if strings.ToLower(filter) == "user" && strings.ToLower(filterValue) != "all"{
		// all vehicles linked with perticular customer
			if strings.ToLower(sb.Owner.Name) == strings.ToLower(filterValue) {
				rab.Vehicles = append(rab.Vehicles, sb);
			}
		} else if strings.ToLower(filter) == "dealer" && strings.ToLower(filterValue) == "all"{
		// all vehicles linked with dealer
			if sb.Dealer.Name != "" {
				rab.Vehicles = append(rab.Vehicles, sb);
			}
		} else if strings.ToLower(filter) == "dealer" && strings.ToLower(filterValue) != "all"{
		// all vehicles linked with perticular dealer
			if strings.ToLower(sb.Dealer.Name) == strings.ToLower(filterValue) {
				rab.Vehicles = append(rab.Vehicles, sb);
			}
		} else if strings.ToLower(filter) == "model" && strings.ToLower(filterValue) != ""{
		// all vehicles linked with perticular model
			if strings.ToLower(sb.Make) == strings.ToLower(filterValue) {
				rab.Vehicles = append(rab.Vehicles, sb);
			}
		} else if strings.ToLower(filter) == "variant" && strings.ToLower(filterValue) != ""{
		// all vehicles linked with perticular variant
			if strings.ToLower(sb.Variant) == strings.ToLower(filterValue) {
				rab.Vehicles = append(rab.Vehicles, sb);
			}
		} else if strings.ToLower(filter) == "engine" && strings.ToLower(filterValue) != ""{
		// all vehicles linked with perticular engine
			if strings.ToLower(sb.Engine) == strings.ToLower(filterValue) {
				rab.Vehicles = append(rab.Vehicles, sb);
			}
		} else if strings.ToLower(filter) == "gearbox" && strings.ToLower(filterValue) != ""{
		// all vehicles linked with perticular gear box
			if strings.ToLower(sb.GearBox) == strings.ToLower(filterValue) {
				rab.Vehicles = append(rab.Vehicles, sb);
			}
		} else if strings.ToLower(filter) == "color" && strings.ToLower(filterValue) != ""{
		// all vehicles linked with perticular color
			if strings.ToLower(sb.Color) == strings.ToLower(filterValue) {
				rab.Vehicles = append(rab.Vehicles, sb);
			}
		} else if strings.ToLower(filter) == "lpn" && strings.ToLower(filterValue) != ""{
		// all vehicles linked with perticular LicensePlateNumber
			if strings.ToLower(sb.LicensePlateNumber) == strings.ToLower(filterValue) {
				rab.Vehicles = append(rab.Vehicles, sb);
			}
		}

	}

	rabAsBytes, _ := json.Marshal(rab)

	///return rabAsBytes, nil
	return shim.Success(rabAsBytes)
}