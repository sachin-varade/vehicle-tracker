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
	"time"		

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

// creating new vehicle in blockchain
///func (t *SimpleChaincode) createVehicle(stub  shim.ChaincodeStubInterface, args []string) ([]byte, error) {
func createVehicle(stub shim.ChaincodeStubInterface, args []string) pb.Response {	

	var err error
	fmt.Println("Running createVehicle")

	if len(args) != 9 {
		fmt.Println("Incorrect number of arguments. Expecting 9 - Make, ChassisNumber, Vin, User, Variant, Engine, Gear box, color, image")
		return shim.Error("Incorrect number of arguments. Expecting 9")
	}

	fmt.Println("Arguments :"+args[0]+","+args[1]+","+args[2]+","+args[3]+","+args[4]+","+args[5]+","+args[6]+","+args[7]+","+args[8]);

	var bt Vehicle
	bt.VehicleId = NewUniqueId()
	bt.Make			= args[0]
	bt.ChassisNumber = args[1]
	bt.Vin = args[2]
	bt.DateOfManufacture = time.Now().Local().String()
	bt.Variant = args[4]
	bt.Engine = args[5]
	bt.GearBox = args[6]
	bt.Color = args[7]
	bt.Image = args[8]

	var own Owner
	own.Name = ""
	own.PhoneNumber = ""
	own.Email = ""
	var del Dealer
	del.Name = ""
	del.PhoneNumber = ""
	del.Email = ""
	bt.Owner = own
	bt.Dealer = del
	
	var tx VehicleTransaction 	
	tx.TType 			= "CREATE"
	tx.UpdatedBy 			= args[3]
	tx.UpdatedOn   			= time.Now().Local().String()
	bt.VehicleTransactions = append(bt.VehicleTransactions, tx)

	//Commit vehicle to ledger
	fmt.Println("createVehicle Commit Vehicle To Ledger");
	btAsBytes, _ := json.Marshal(bt)
	err = stub.PutState(bt.VehicleId, btAsBytes)
	if err != nil {
		//return nil, err
		return shim.Error(err.Error())
	}

	//Update All Vehicles Array
	allBAsBytes, err := stub.GetState("allVehicles")
	if err != nil {
		return shim.Error("Failed to get all Vehicles")
	}
	var allb AllVehicles
	err = json.Unmarshal(allBAsBytes, &allb)
	if err != nil {
		return shim.Error("Failed to Unmarshal all Vehicles")
	}
	allb.Vehicles = append(allb.Vehicles,bt.VehicleId)

	allBuAsBytes, _ := json.Marshal(allb)
	err = stub.PutState("allVehicles", allBuAsBytes)
	if err != nil {
		//return nil, err
		return shim.Error(err.Error())
	}

	///return nil, nil
	return shim.Success(nil)
}
	
// Updating existing vehicle in blockchain
func updateVehicle(stub  shim.ChaincodeStubInterface, args []string) pb.Response {	

	var err error
	fmt.Println("Running updateVehicle")

	fmt.Println("Arguments :"+args[0]+","+args[1]+","+args[2]+","+args[3]+","+args[4]+","+args[5]+","+args[6]+","+args[7]);

	//Get and Update Part data
	bAsBytes, err := stub.GetState(args[0])
	if err != nil {
		return shim.Error("Failed to get Vehicle #" + args[0])
	}
	var bch Vehicle
	err = json.Unmarshal(bAsBytes, &bch)
	if err != nil {
		return shim.Error("Failed to Unmarshal Vehicle #" + args[0])
	}	
	
	var updateStr string
	if bch.Owner.Name 	!= args[2] {
		bch.Owner.Name 	= args[2]
		updateStr += ",Owner Name to "+ args[2]
	}

	if bch.Owner.PhoneNumber != args[3] {
		bch.Owner.PhoneNumber 	= args[3]
		updateStr += ",Owner Phone to "+ args[3]
	}

	if bch.Owner.Email != args[4] {
		bch.Owner.Email 	= args[4]
		updateStr += ",Owner Email to "+ args[4]
	}
	
	bch.Dealer.Name 	= args[5]
	bch.Dealer.PhoneNumber 	= args[6]
	bch.Dealer.Email 	= args[7]
	
	if bch.LicensePlateNumber != args[8] {
		bch.LicensePlateNumber=  args[8]
		updateStr += ",License Plate Number to "+ args[8]
	}

	if bch.DateofDelivery != args[9] {
		bch.DateofDelivery =  args[9]
		updateStr += ",Date of Delivery to "+ args[9]
	}

	////// create warranty end date, 1 yr's from warranty start date 
	if args[10] != "" {
		var tt =time.Now()
		const shortForm = "2006-Jan-02"
		tt, _ = time.Parse(shortForm, args[10])
		fmt.Println(tt)
		fmt.Println(tt.AddDate(1, 0, 0).Local().String())
		args[11] = tt.AddDate(1, 0, 0).Local().String()
		args[11] = strings.Split(args[11], " ")[0]	
	}

	if bch.WarrantyStartDate != args[10] {
		bch.WarrantyStartDate =  args[10]
		updateStr += ",Warranty Start Date to "+ args[10]
	}

	if bch.WarrantyEndDate != args[11] {
		bch.WarrantyEndDate =  args[11]
		updateStr += ",Warranty End Date to "+ args[11]
	}	
	
	var tx VehicleTransaction 
	
	tx.WarrantyStartDate	= args[10]
	tx.WarrantyEndDate	=  args[11]
	tx.UpdatedBy   	= args[12]
	tx.UpdatedOn   	= time.Now().Local().String()
	
	//parts-13
	var serv VehicleService
	if args[13] != "" {
		p := strings.Split(args[13], ",")
		var pr Part
		//var prFound string
		updateStr += ",Parts: "
		for i := range p {
			c := strings.Split(p[i], "^")
			pr.PartId = c[0]
			pr.PartCode = c[1]
			pr.PartType = c[2]
			pr.PartName = c[3]
			// for j := range bch.Parts {
			// 	if bch.Parts[j].PartId == pr.PartId {
			// 		prFound = "Y"
			// 	}
			// }

			// if prFound == "Y" {
			// 	updateStr += "~Replaced Part #"+ pr.PartId			
			// 	prFound = "N"
			// } else{
				updateStr += "~Added Part #"+ pr.PartId	+"("+ pr.PartName +")"		
			//}
			bch.Parts = append(bch.Parts, pr)
			serv.Parts = append(serv.Parts, pr)
		}
	}
	
	tx.TType 	= args[1]
	// saving update string
	tx.TValue = updateStr
	bch.VehicleTransactions = append(bch.VehicleTransactions, tx)

	// service
	if args[14] == "Y" {		
		serv.ServiceDescription = args[15]
		serv.ServiceDoneBy = args[12]
		serv.ServiceDoneOn = time.Now().Local().String()
		bch.VehicleService = append(bch.VehicleService, serv)		
	}
		
	//Commit updates part to ledger
	fmt.Println("updateVehicle Commit Updates To Ledger");
	btAsBytes, _ := json.Marshal(bch)
	err = stub.PutState(bch.VehicleId, btAsBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(nil)
}

// creating new part in blockchain
func createPart(stub  shim.ChaincodeStubInterface, args []string) pb.Response {	
	var err error
	fmt.Println("Running createPart")

	if len(args) != 4 {
		fmt.Println("Incorrect number of arguments. Expecting 4 - PartId, Product Code, Manufacture Date, User")
		return shim.Error("Incorrect number of arguments. Expecting 4")
	}

	fmt.Println("Arguments :"+args[0]+","+args[1]+","+args[2]+","+args[3]);

	var bt Part
	bt.PartId 			= args[0]
	bt.ProductCode			= args[1]
	var tx Transaction
	tx.DateOfManufacture		= args[2]
	tx.TType 			= "CREATE"
	tx.User 			= args[3]
	bt.Transactions = append(bt.Transactions, tx)

	//Commit part to ledger
	fmt.Println("createPart Commit Part To Ledger");
	btAsBytes, _ := json.Marshal(bt)
	err = stub.PutState(bt.PartId, btAsBytes)
	if err != nil {		
		return shim.Error(err.Error())
	}

	//Update All Parts Array
	allBAsBytes, err := stub.GetState("allParts")
	if err != nil {
		return shim.Error("Failed to get all Parts")
	}
	var allb AllParts
	err = json.Unmarshal(allBAsBytes, &allb)
	if err != nil {
		return shim.Error("Failed to Unmarshal all Parts")
	}
	allb.Parts = append(allb.Parts,bt.PartId)

	allBuAsBytes, _ := json.Marshal(allb)
	err = stub.PutState("allParts", allBuAsBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(nil)
}

// Updating existing part in blockchain
func updatePart(stub  shim.ChaincodeStubInterface, args []string) pb.Response {	
	var err error
	fmt.Println("Running updatePart")

	if len(args) != 8 {
		fmt.Println("Incorrect number of arguments. Expecting 8 - PartId, Vehicle Id, Delivery Date, Installation Date, User, Warranty Start Date, Warranty End Date, Type")
		return shim.Error("Incorrect number of arguments. Expecting 8")
	}
	fmt.Println("Arguments :"+args[0]+","+args[1]+","+args[2]+","+args[3]+","+args[4]+","+args[5]+","+args[6]+","+args[7]);

	//Get and Update Part data
	bAsBytes, err := stub.GetState(args[0])
	if err != nil {
		return shim.Error("Failed to get Part #" + args[0])
	}
	var bch Part
	err = json.Unmarshal(bAsBytes, &bch)
	if err != nil {
		return shim.Error("Failed to Unmarshal Part #" + args[0])
	}

	var tx Transaction
	tx.TType 	= args[7];

	tx.VehicleId		= args[1]
	tx.DateOfDelivery	= args[2]
	tx.DateOfInstallation	= args[3]
	tx.User  		= args[4]
	tx.WarrantyStartDate	= args[5]
	tx.WarrantyEndDate	= args[6]


	bch.Transactions = append(bch.Transactions, tx)

	//Commit updates part to ledger
	fmt.Println("updatePart Commit Updates To Ledger");
	btAsBytes, _ := json.Marshal(bch)
	err = stub.PutState(bch.PartId, btAsBytes)
	if err != nil {		
		return shim.Error(err.Error())
	}

	return shim.Success(nil)
}