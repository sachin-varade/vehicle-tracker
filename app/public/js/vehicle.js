/*eslint-env browser */
/* global clear_blocks */
/* global formatMoney */
/* global in_array */
/* global new_block */
/* global formatDate */
/* global nDig */
/* global randStr */
/* global bag */
/* global $ */
var ws = {};
var user = {username: bag.session.username, displayname: bag.session.displayname, user_role: bag.session.user_role};

var valid_customers = bag.session.allUsers.filter(function(_o){
	return _o.role == "CUSTOMER";
});
var valid_dealers = bag.session.allUsers.filter(function(_o){
	return _o.role == "DEALER";
});
var partsBlockChainUrl = "http://win10dv31190.cloudapp.net:3000";// "http://win10marble1409.cloudapp.net:6001";
var allChassisNumbers = [];
var panels = [
	{
		name: "dashboard",
		formID: "dashboardFilter",
		tableID: "#dashboardBody",
		filterPrefix: "dashboard_"
	}
];
var lastTx = ''
var allVehicleModels = ["Mercedes-Benz CLA", "Mercedes-Benz S-Class", "Mercedes-Benz E-Class", "Mercedes-Benz GLE"];
var allModelVariants = {
	'Mercedes-Benz CLA': ['200 CDI Style', '200 Petrol Sport', '200 CDI Sport', '45 AMG 4MATIC'],
	'Mercedes-Benz S-Class': ['S 350 CDI', 'S 350 CDI Connoisseur’s Edition', 'S 400', 'S 500', 'Maybach S 500'],
	'Mercedes-Benz E-Class': ['E 200', 'E 200 d', 'E 350 d'],
	'Mercedes-Benz GLE': ['250 d', '350 d', '400 4MATIC']
}
var allColors = ["Jupiter Red", "Cavansite Blue", "Polar Silver", "Mountain Grey", "Cirrus White", "Obsidian Black", "Citrine Brown", "Iridium Silver"];

var allEngines = {
	'Mercedes-Benz CLA': ['2143cc Diesel', '1991cc Petrol'],
	'Mercedes-Benz S-Class': ['2987cc Diesel', '2996cc Petrol', '4663cc Petrol'],
	'Mercedes-Benz E-Class': ['1991cc Petrol', '1950cc Diesel', '2987cc Diesel'],
	'Mercedes-Benz GLE': ['2143cc Diesel', '2987cc Diesel', '2996cc Petrol']
}

var allGearBoxes = {
	'Mercedes-Benz CLA': ['7 Gears, Front Wheel Drive'],
	'Mercedes-Benz S-Class': ['7 Gears, Automatic, Rear Wheel Drive', '9 Gears, Automatic, Rear Wheel Drive'],
	'Mercedes-Benz E-Class': ['9 Gears, Automatic, Rear Wheel Drive'],
	'Mercedes-Benz GLE': ['7 Gears, Automatic, 4WD / AWD', '9 Gears, Automatic, 4WD / AWD']
}

var allSeatingCapacity = {
	'BMW X1': ['5 seater'],
	'BMW X3': ['5 seater'],
	'BMW X5': ['7 seater', '5 seater'],
	'BMW X6': ['5 seater']
}

var partTypes = [
	"Air Intake Parts",
	"Body Exterior Parts",
	"Body Interior Parts",
	"Brake Parts",
	"Climate Control Parts",
	"Clutch Parts",
	"Cooling System Parts",
	"Drive Belts Parts",
	"Driveshaft and Axle Parts",
	"Engine Electrical Parts",
	"Engine Mechanical Parts",
	"Exhaust Parts",
	"Fuel System Parts",
	"Steering Parts",
	"Suspension Parts",
	"Transmission Parts",
	"Performance Parts Parts",
	"Manuals and Accessories Parts",
	"Chemicals and Fluids Parts",
	"Tools and Hardware Parts",
	"Maintenance Parts"
];

// =================================================================================
// On Load
// =================================================================================
$(document).on('ready', function() {
	// user.username = "SKF";
	// bag.session.user_role="MANUFACTURER";
	connect_to_server();
	if(user.username)
	{
		$("#userField").html(user.displayname+ ' ('+ user.user_role.toLowerCase() +')');
	}

	// Customize which panels show up for which user
	$(".nav").hide();
	//console.log("user role", bag.session.user_role);

	// Only show tabs if a user is logged in
	if(user.username) {
		$("#vehiclesnav").show();
		$("#partsnav").show();
		$("#validatePartLink").show();
		// Display tabs based on user's role
		if (user.username==="MANUFACTURER" || bag.session.user_role.toUpperCase() === "MANUFACTURER"){
			$('#vehicleDashboardPanel').show();
			$("#createVehicleTable").hide();
			$("#newVehiclePanel").hide();
			
			$("#filterBar").show();
			$("#dashboardTablevehicles").show();
			$("#searchBar").hide();

			$("#newVehicle").show();
			$("#updateVehicle").show();
			$("#newPartLink").show();
			$("#updatePartLink").hide();
			$("#dashboardLink").show();
			
			
			$("#dashboardLink").show();
			$("#dashboardPanel").show();
			$("#createNewVehicle").show();
			$("#batchDetailsTable").hide();			
		 }
		else if(bag.session.user_role && bag.session.user_role.toUpperCase() === "DEALER") {
			$('#vehicleDashboardPanel').show();
			$("#createVehicleTable").hide();
			$("#newVehiclePanel").hide();			
			$("#newPartLink").hide();
			$("#updatePartLink").show();			
			
			
			$("#dashboardLink").show();
			$("#dashboardPanel").show();
			$("#createNewVehicle").hide();
			$("#batchDetailsTable").hide();	
			$("#searchBar").css({"width":"100%","text-align":"center"});
		}
		else if (user.username==="SERVICE_CENTER" || bag.session.user_role.toUpperCase() === "SERVICE_CENTER"){
			$("#createVehicleTable").hide();
			$('#vehicleDashboardPanel').show();
			$("#newVehiclePanel").hide();
			$("#vehicles").show();
			$("#newVehicle").show();
			$("#updateVehicle").show();
			$("#newPartLink").show();
			$("#updatePartLink").show();
			$("#dashboardLink").show();
			$("#newPartLink").hide();
			$("#updatePartLink").hide();			
			
			$("#dashboardLink").show();
			$("#dashboardPanel").show();
			$("#createNewVehicle").hide();
			$("#partsPanelTR").show();
			$("#serviceHistoryPanelTR").show();
			
			$("#batchDetailsTable").hide();		
			$("#searchBar").css({"width":"100%","text-align":"center"});
			
		 }
		 else if(bag.session.user_role && bag.session.user_role.toUpperCase() === "CUSTOMER") {
			$('#vehicleDashboardPanel').show();
			$("#createVehicleTable").hide();
			$("#newVehiclePanel").hide();
			
			$("#newPartLink").hide();
			$("#updatePartLink").hide();			
			
			
			$("#dashboardLink").hide();
			$("#dashboardPanel").hide();
			
			$("#batchDetailsTable").hide();	
			$("#vehiclesnav").hide();	
			$("#partsnav").hide();	
			$("#customerVehicleLink").show();
			$("#serviceHistoryPanelTR").show();	
			$("#createNewVehicle").hide();
		}		
		else if(user.username) {
			$("#newPartLink").show();
			$("#newPartPanel").hide();
			$("#dashboardLink").show();
			$("#updatePartLink").hide();
			$("#dashboardPanel").show();
			$("#updatePartPanel").hide();
		}		

	}

	$("#createNewVehicle").click(function(){
		$("#vehicleList").show();
		//$("#createNewVehicle").hide();
		$('#vehicleDashboardPanel').hide();
		$("#createVehicleTable").show();
		$("#newVehiclePanel").show();

		console.log("Fill all models in dropdown");
		$("#allModels").empty().append('<option id=""></option>')
		for(var i in allVehicleModels){
			var _selected = "";					
			$("#allModels").append('<option '+ _selected +' id="'+ allVehicleModels[i] +'">'+ allVehicleModels[i] +'</option>')
		}
		$("#allModels").change();

		$("#allColors").empty();
		for(var i in allColors){
			$("#allColors").append('<option id="'+ allColors[i] +'">'+ allColors[i] +'</option>')
		}	
	});

	$("#allModels").change(function(){
		console.log('allModels dropdown change');

		var $variantDropdown = $('#allModelVariant');
		$variantDropdown.html('');
		var variant = $(this).val(), variants = allModelVariants[variant] || [];
        
        var html = $.map(variants, function(variantValue){
            return '<option value="' + variantValue + '">' + variantValue + '</option>'
        }).join('');
		$variantDropdown.html(html);
		
		var $allEngines = $('#allEngines');
		var engine = $(this).val(), engines = allEngines[engine] || [];
        
        var html = $.map(engines, function(eval){
            return '<option value="' + eval + '">' + eval + '</option>'
        }).join('');
		$allEngines.html(html);
		
		var $allGearBoxes = $('#allGearBoxes');
		var gb = $(this).val(), gbs = allGearBoxes[gb] || [];
        
        var html = $.map(gbs, function(eval){
            return '<option value="' + eval + '">' + eval + '</option>'
        }).join('');
		$allGearBoxes.html(html);
		
		$("#carImage").html("<img src='imgs/cars/"+ gb.replace(" ","_") +".jpg'/>")
    });

	$("#vehicleList").click(function(){
		$("#vehicleList").hide();
		$("#createNewVehicle").show();
		$('#vehicleDashboardPanel').show();
		$("#createVehicleTable").hide();
		$("#newVehiclePanel").hide();
	});

	$("#editVehicleDetails").click(function(){
		$('#vehicleDetailsTable').show();
		$('#batchDetailsTable').hide();
		$("#allPartTypes").empty().append('<option id=""></option>')
		for(var i in partTypes){
			$("#allPartTypes").append('<option id="'+ partTypes[i] +'">'+ partTypes[i] +'</option>');
		}
		$("#allPartTypes").change();
		// show/hide panels as per the role
		if(bag.session.user_role.toUpperCase() === "MANUFACTURER"){
			$("#allCustomers").attr("disabled","disabled");
			$("#divServiceDue").hide();			
			$("input[name='upLicensePlateNumber']").attr("disabled","disabled");
			$("input[name='upWarrantyStartDate']").attr("disabled","disabled");
			$("input[name='upWarrantyEndDate']").attr("disabled","disabled");
			$("input[name='upDateofDelivery']").attr("disabled","disabled");
			$("#trUpdateVehicle").hide();
			$("#createNewVehicle").show();
			$("input[name='upVariant'],input[name='upEngine'],input[name='upGearBox'],input[name='upColor'],input[name='upLastServiceDate'],input[name='upServiceDue'],input[name='allCustomers'],input[name='upDealer'],input[name='upLicensePlateNumber'],input[name='upMake'],input[name='upVin'],input[name='upVin'],input[name='upDateOfManufacture'],input[name='upWarrantyStartDate'],input[name='upWarrantyEndDate'],input[name='upDateofDelivery']")
				.css({'border': '0px','border-bottom': '0px solid #ccc','border-radius': '0px'});
			$("#allCustomers").css({'border': '0px','border-bottom': '0px solid #ccc','border-radius': '0px'});
			$("#trServiceDetails").hide();
		}
		else if(bag.session.user_role.toUpperCase() === "DEALER"){
			$("#divServiceDue").hide();
			$("#createNewVehicle").hide();
			$("#divWarrantyEndDate").hide();
			if($("input[name='upWarrantyStartDate']").val() != ""){
				$("#trUpdateVehicle").hide();
				$("#divWarrantyEndDate").show();
				$("#allCustomers").attr("disabled","disabled");
				
				$("input[name='upLicensePlateNumber']").attr("disabled","disabled");
				$("input[name='upWarrantyStartDate']").attr("disabled","disabled");
				$("input[name='upWarrantyEndDate']").attr("disabled","disabled");
				$("input[name='upDateofDelivery']").attr("disabled","disabled");

				$("input[name='upVariant'],input[name='upEngine'],input[name='upGearBox'],input[name='upColor'],input[name='upLicensePlateNumber'],input[name='upWarrantyStartDate'],input[name='upDateofDelivery'],input[name='upWarrantyEndDate']")
				.css({'border': '0px','border-bottom': '0px solid #ccc','border-radius': '0px'});

				$("#allCustomers").css({'border': '0px','border-bottom': '0px solid #ccc','border-radius': '0px'});
			}
			else{
				$("#trUpdateVehicle").show();
				$("#divWarrantyEndDate").hide();
				$("#allCustomers").attr("disabled",false);
				
				$("input[name='upLicensePlateNumber']").attr("disabled",false);
				$("input[name='upWarrantyStartDate']").attr("disabled",false);				
				$("input[name='upDateofDelivery']").attr("disabled",false);

				$("input[name='upLicensePlateNumber'],input[name='upWarrantyStartDate'],input[name='upDateofDelivery'],input[name='upWarrantyEndDate']")
				.css({'border': '1px solid #ccc','border-radius': '7px'});
				$("#allCustomers").css({'border': '1px solid #D4DCDC','border-radius': '7px'});
			}
			$("input[name='upLastServiceDate'],input[name='upServiceDue'],input[name='upDealer'],input[name='upMake'],input[name='upVin'],input[name='upDateOfManufacture'],input[name='upWarrantyEndDate']")
				.css({'border': '0px','border-bottom': '0px solid #ccc','border-radius': '0px'});
			
			// hide service details section for dealer
			$("#trServiceDetails").hide();
		}
		else if(bag.session.user_role.toUpperCase() === "SERVICE_CENTER"){
			$("#divServiceDue").show();
			$("#createNewVehicle").hide();
			$("#allCustomers").attr("disabled","disabled");
			$("input[name='upLicensePlateNumber']").attr("disabled","disabled");
			$("input[name='upWarrantyStartDate']").attr("disabled","disabled");
			$("input[name='upWarrantyEndDate']").attr("disabled","disabled");
			$("input[name='upDateofDelivery']").attr("disabled","disabled");
			$("input[name='upLastServiceDate'],input[name='upVariant'],input[name='upEngine'],input[name='upGearBox'],input[name='upColor'],input[name='upServiceDue'],input[name='allCustomers'],input[name='upDealer'],input[name='upLicensePlateNumber'],input[name='upMake'],input[name='upVin'],input[name='upDateOfManufacture'],input[name='upWarrantyStartDate'],input[name='upWarrantyEndDate'],input[name='upDateofDelivery']")
				.css({'border': '0px','border-bottom': '0px solid #ccc','border-radius': '0px'});
			$("#allCustomers").css({'border': '0px','border-bottom': '0px solid #ccc','border-radius': '0px'});
		}
	});
	
	$("#dashboard_Vin").keyup(function(){
		$("#vehicledashboardBody").find("tr").each(function(r){
			if($($(this).find("td")[1]).html().indexOf($("#dashboard_Vin").val().toUpperCase()) > -1){
				$(this).show();
			}
			else{
				$(this).hide();
			}
		});
	});

	$("#scVin").on('keypress', function (e) {
		if (e.which == 13) {
			if($("#scVin").val()==""){
				alert("Please enter Vehicle VIN");
				return false;
			}
			e.preventDefault();
			$("#vehicleErrorMessage").hide();
			$("#batchDetailsTable").hide();
			$("#vehicleDetailsTable").hide();
			$("#searchBar").css({"width":"20%","text-align":"left"});
			ws.send(JSON.stringify({type: "getVehicleByChassisNumber", chassisNumber: $("#scVin").val()}));
		}
	});

	$("#scPartId").on('keypress', function (e) {
		if (e.which == 13) {
			if($("#scPartId").val()==""){
				alert("Please enter Part Id");
				return false;
			}
			e.preventDefault();
			$.ajax({
				url : partsBlockChainUrl +'/getPart/'+ $("#scPartId").val(),
				type : 'GET',				
				dataType:'json',
				success : function(data) {              										
					if(data){
						onMessage({data: JSON.stringify({msg: 'part', part: data, state: 'finished'})});
					}
					else{
						$("#notFoundPartHeader").html("The entered part '"+ $("#scPartId").val() +"' is not valid.");
						$("#batchDetailsBody").html("");
						$("#batchDetailsTable").show();
					}
				},
				error : function(request,error)
				{
					$("#bDetHeader").html("<div style='font-size:20px;text-align:left;'>The entered part '"+ $("#scPartId").val() +"' is not valid.</div>");
					$("#batchDetailsBody").html("");
					$("#batchDetailsTable").show();
				}
			});
		}
	});

	$("#btnAddPart").click(function(){

		$( "#dialog-confirm" ).dialog({
			resizable: false,
			height: "auto",
			width: 600,
			dialogClass: 'fixed-dialog', 
			modal: true,
			buttons: {
			  "Add Part": function() {
				$("#upPartsAddedBySC").append("<div class='selected-parts-by-sc' data='"+ $("input[name='upPartId']").val() +"^"+ $("#hdnSelectedPartCode").val() +"^"+ $("#hdnSelectedPartType").val() +"^"+ $("#hdnSelectedPartName").val() +"' style='margin:3px;float:left;border: solid 1px #ccc;border-radius: 7px;padding: 4px;display: block;' id='"+ $("input[name='upPartId']").val()+"'>"+ $("input[name='upPartId']").val() +"-"+ $("#hdnSelectedPartName").val() +"<b class='close-part-remove' onclick='var xBtn=this;$(this).parent().remove();' style='color:red;margin-left:4px;font-weight:bold;border: solid 1px #ccc;height: 14px;display: inline-block;width: 11px;padding: 0px;padding-left: 2px;border-radius: 3px;font-size: 14px;cursor:pointer;'>X</b></div>");
				$("input[name='upPartId']").val("");
				$( this ).dialog( "close" );
			  },
			  Cancel: function() {
				$( this ).dialog( "close" );
			  }
			}
		  });
		  $($(".ui-dialog-buttonset").find("button")[0]).hide();
		  $("#popup-part-header").html("");
		  $("#popup-part-details").html("");

		//validate if part id and part type are selected
		if($("input[name='upPartId']").val() == ""){
			$("#popup-part-details").html("Please enter Part Id.");					
			return false;
		}
		else if($("#allPartTypes").val() == ""){
			$("#popup-part-details").html("Please select Part Type.");					
			return false;
		}
		
		//validation for already selected part
		var _partFound = false;
		$(".selected-parts-by-sc").each(function(obj){
			if($(this).attr("data").indexOf($("input[name='upPartId']").val()) > -1){
				_partFound = true;				
			}
		});
		
		if(_partFound){
			$("#popup-part-details").html("You have already selected this part '"+ $("input[name='upPartId']").val() +"' to add.");					
			return false;
		}
		  $.ajax({
			url : partsBlockChainUrl +'/getPart/'+ $("input[name='upPartId']").val(),
			type : 'GET',				
			dataType:'json',
			success : function(data) {              										
				if(data){
					//validate if this part is installed in another machine.
					var tx = data.transactions;
					if(data.partType != $("#allPartTypes").val()){
						$("#popup-part-details").html("The selected part '"+ $("input[name='upPartId']").val() +"' does not belong to \""+ $("#allPartTypes").val() +"\", but it belongs to \""+ data.partType +"\".");					
						return false;
					}
					for(var vi=0;vi<tx.length;vi++){
						if(tx[vi].ttype == "PART_INSTALLED" && tx[vi].vin != "" && tx[vi].vin != $("input[name='upVin']").val()){
							$("#popup-part-details").html("The selected part '"+ $("input[name='upPartId']").val() +"' is already installed on another Vehicle, please use another Part.");					
							return false;
						}
						else if(tx[vi].ttype == "PART_INSTALLED" && tx[vi].vin != "" && tx[vi].vin == $("input[name='upVin']").val()){
							$("#popup-part-details").html("The selected part '"+ $("input[name='upPartId']").val() +"' is already installed on this Vehicle.");					
							return false;
						}
					}

					//show the part details
					var _headerDetails = "<p><span>Part Id: </span>"+ data.partId +" ("+ data.partName +")</p>";
					//_headerDetails+= "<p><span>Part Code: </span>"+ data.partCode +"</p>";
					//_headerDetails+= "<p><span>Part Type: </span>"+ data.partType +"</p>";
					//_headerDetails+= "<p><span>Part Name: </span>"+ data.partName +"</p>";
					//_headerDetails+= "<p><span>Description: </span>"+ data.description +"</p>";
					$("#popup-part-header").html(_headerDetails);

					var _txDetails = "";
					_txDetails += "<p class='ui-dialog-title ui-popup-grid-header'>Transactions: </p>";
					_txDetails += "<table class='part-transactions-popup'>";
					for(var vi=0;vi<tx.length;vi++){
						_txDetails += formatPartTransactions(tx[vi], {part: data});
					}
					_txDetails += "</table>";
					_txDetails += "<input type='hidden' id='hdnSelectedPartCode' value='"+ data.partCode +"'>";
					_txDetails += "<input type='hidden' id='hdnSelectedPartType' value='"+ data.partType +"'>";
					_txDetails += "<input type='hidden' id='hdnSelectedPartName' value='"+ data.partName +"'>";
					$("#popup-part-details").html(_txDetails);
					$($(".ui-dialog-buttonset").find("button")[0]).show();
				}
				else{
					$($(".ui-dialog-buttonset").find("button")[0]).hide();
					$("#popup-part-details").html("The selected part '"+ $("input[name='upPartId']").val() +"' is not valid.");					
				}
			},
			error : function(request,error)
			{
				$($(".ui-dialog-buttonset").find("button")[0]).hide();
				$("#popup-part-details").html("<div style='font-size:20px;text-align:left;'>The selected part '"+$("input[name='upPartId']").val() +"' is not valid.</div>");
			}
		  });
		  return;
	});

	$("#createVehicle").click(function(){
		console.log("submitting createVehicle Form");
		//// validate
		if($("#allModels").val() === ""){
			alert("Please select Model/Variant/Engine/GearBox.");
			return false;
		}
		if($("input[name='txtVin']").val() === ""){
			alert("Please enter VIN.");
			return false;
		}
		if(user.username){
			var obj = 	{
							type: "createVehicle",
							vehicle: {
								make: $("#allModels").val(),
								chassisNumber: $("input[name='txtVin']").val(),
								vin: $("input[name='txtVin']").val(),		
								variant: $("#allModelVariant").val(),
								engine: $("#allEngines").val(),
								gearBox: $("#allGearBoxes").val(),
								color: $("#allColors").val(),
								image: $($("#carImage").find("img")[0]).attr("src")
							}
						};

			if(obj.vehicle && obj.vehicle.chassisNumber){
				var exists = $.inArray(obj.vehicle.chassisNumber, allChassisNumbers);
				if(exists == -1) {
					console.log('creating vehicle, sending', obj);
					ws.send(JSON.stringify(obj));
					$(".panel").hide();
					$('#batchTag').html('');
					$('#spinner').show();
					$('#tagWrapper').hide();
					//$("#batchTagPanel").show();
					$("input[name='Make']").val('');
					$("input[name='txtVin']").val(''),
					$("input[name='txtVin']").val('')
				} else {
					//alert('Part with id '+obj.part.partId+' already exists.');
					$("#errorName").html("Error");
					$("#errorNoticeText").html('Vehicle with VIN number- '+obj.vehicle.chassisNumber+' already exists.');
					$("#errorNotificationPanel").fadeIn();
				}
			}
		}
		return false;
	});

	$("#updateVehicle").click(function(){
		console.log("updating Vehicle");
		if(user.username){
			var tranType = "";
			if(bag.session.user_role.toUpperCase() === "DEALER") {
				tranType = "DEALER";
			} else if(bag.session.user_role.toUpperCase() === "SERVICE_CENTER") {
				tranType = "SERVICE_CENTER";
			}
			var _parts = "";
			$(".selected-parts-by-sc").each(function(obj){
				if($(this).attr("data") != ""){
					if(_parts == ""){
						_parts = $(this).attr("data");
					}
					else{
						_parts += ","+ $(this).attr("data");
					}
				}
			});
			
			var dealerName = "";
			if($("input[name='upDealer']").val() != ""){
				var _dealerUserName =  valid_dealers.filter(function(_o){
					return _o.displayname == $("input[name='upDealer']").val();
				});
				if(_dealerUserName && _dealerUserName.length > 0){
					dealerName = _dealerUserName[0].username;
				}
			}
			else{
				dealerName = user.username;
			}
			var obj = 	{
							type: "updateVehicle",
							vehicle: {
								vehicleId: $("input[name='upVehicleId']").val(),
								ttype: tranType,

								owner: {name: $('#allCustomers').val(), email: '', phoneNumber: ''},
								dealer: {name: dealerName, email: '', phoneNumber: ''},
								licensePlateNumber:  $("input[name='upLicensePlateNumber']").val(),
								warrantyStartDate: moment($("input[name='upWarrantyStartDate']").val()).format("YYYY-MMM-DD"),
								warrantyEndDate: $("input[name='upWarrantyEndDate']").val(),
								dateofDelivery: $("input[name='upDateofDelivery']").val(),
								parts: _parts,
								serviceDone: $("#upServiceDone").is(":checked") ? "Y" : "N",
								serviceDescription: $("#upServiceDesc").val()
							}
						};

			//rest call to part to update the vin if part is added
			setTimeout(function(){
				updatePartVin(_parts);
			},3000)

			console.log('obj.part :'+obj.vehicle+' obj.part.partId:'+obj.vehicle.vehicleId);
			if(obj.vehicle && obj.vehicle.vehicleId){
					console.log('updating vehicle data, sending', obj);
					ws.send(JSON.stringify(obj));
					$(".panel").hide();
					$('#batchTag').html('');
					$('#spinner').show();
					$('#tagWrapper').hide();
					//$("#batchTagPanel").show();
					$("input[name='PartIdToUpdate']").val('');
					$("input[name='VehicleId']").val('');
					$("input[name='DateOfDelivery']").val('');
					$("input[name='DateOfInstallation']").val('');
					$("input[name='WarrantyStartDate']").val('');
					$("input[name='WarrantyEndDate']").val('');
					$("#upServiceDone").attr("checked", false);
					$("#upServiceDesc").val('')
					$("#upPartsAddedBySC").html("");
					console.log("update request sent");
			}
		}
		return false;
	});

	$("#submit").click(function(){
		console.log("submitting createPart Form");
		if(user.username){
			var obj = 	{
							type: "createPart",
							part: {
								partId: $("input[name='PartId']").val(),
								productCode: $("input[name='ProductCode']").val(),
								dateOfManufacture: $("input[name='DateOfManufacture']").val()
							}
						};

			if(obj.part && obj.part.partId){
				var exists = $.inArray(obj.part.partId, allParts);
				if(exists == -1) {
					console.log('creating part, sending', obj);
					ws.send(JSON.stringify(obj));
					$(".panel").hide();
					$('#batchTag').html('');
					$('#spinner').show();
					$('#tagWrapper').hide();
					//$("#batchTagPanel").show();
					$("input[name='PartId']").val('');
					$("input[name='ProductCode']").val(''),
					$("input[name='DateOfManufacture']").val('')
					//$("#submit").prop('disabled', true);
				} else {
					//alert('Part with id '+obj.part.partId+' already exists.');
					$("#errorName").html("Error");
					$("#errorNoticeText").html('Part with id '+obj.part.partId+' already exists.');
					$("#errorNotificationPanel").fadeIn();
				}
			}
		}
		return false;
	});

	$("#update").click(function(){
		console.log("updating Part");
		if(user.username){
			var tranType;
			if(bag.session.user_role.toUpperCase() === "DEALER") {
				tranType = "DELIVERY";
			} else if(bag.session.user_role.toUpperCase() === "SERVICE_CENTER") {
				tranType = "INSTALLED";
			}
			var obj = 	{
							type: "updatePart",
							part: {
								partId: $("input[name='PartIdToUpdate']").val(),
								vehicleId: $("input[name='VehicleId']").val(),
								dateOfDelivery: $("input[name='DateOfDelivery']").val(),
								dateOfInstallation: $("input[name='DateOfInstallation']").val(),
								warrantyStartDate: $("input[name='WarrantyStartDate']").val(),
								warrantyEndDate: $("input[name='WarrantyEndDate']").val(),
								tranType: tranType
							}
						};
			console.log('obj.part :'+obj.part+' obj.part.partId:'+obj.part.partId);
			if(obj.part && obj.part.partId){
				var exists = $.inArray(obj.part.partId, allParts);
				if(exists >= 0) {
					console.log('updating part data, sending', obj);
					ws.send(JSON.stringify(obj));
					$(".panel").hide();
					$('#batchTag').html('');
					$('#spinner').show();
					$('#tagWrapper').hide();
					//$("#batchTagPanel").show();
					$("input[name='PartIdToUpdate']").val('');
					$("input[name='VehicleId']").val('');
					$("input[name='DateOfDelivery']").val('');
					$("input[name='DateOfInstallation']").val('');
					$("input[name='WarrantyStartDate']").val('');
					$("input[name='WarrantyEndDate']").val('');
					console.log("update request sent");
					//$("#submit").prop('disabled', true);
				} else {
					//alert('Part '+ obj.part.partId +' not found');
					$("#errorName").html("Error");
					$("#errorNoticeText").html('Part '+ obj.part.partId +' not found');
					$("#errorNotificationPanel").fadeIn();
				}
			}
		}
		return false;
	});

	$("#newPartLink").click(function(){
		//$("#batchTagPanel").hide();
		$("#newPartPanel").show();
	});
	
	$("#updatePartLink").click(function(){
		
		$("#updatePartPanel").show();
		$("#dashboardPanel").hide();
		$("#newPartPanel").hide();
		if(user.username === "SERVICE_CENTER" || bag.session.user_role.toUpperCase() === "SERVICE_CENTER") {
			/*$("#deliveryDt").prop('disabled', true);
			$("#vehicleId").prop('disabled', false);
			$("#installationDt").prop('disabled', false);
			$("#warrantyStartDt").prop('disabled', false);
			$("#warrantyEndDt").prop('disabled', false);*/

			$("#deliveryDt").css('display', 'none');
			$("#vehicleId").css('display', 'block');
			$("#installationDt").css('display', 'block');
			$("#warrantyStartDt").css('display', 'block');
			$("#warrantyEndDt").css('display', 'block');
		}
		else if(user.username === "DEALER" || bag.session.user_role.toUpperCase() === "DEALER"){
			/*$("#deliveryDt").prop('disabled', false);
			$("#vehicleId").prop('disabled', true);
			$("#installationDt").prop('disabled', true);
			$("#warrantyStartDt").prop('disabled', true);
			$("#warrantyEndDt").prop('disabled', true);*/

			$("#deliveryDt").css('display', 'block');
			$("#vehicleId").css('display', 'none');
			$("#installationDt").css('display', 'none');
			$("#warrantyStartDt").css('display', 'none');
			$("#warrantyEndDt").css('display', 'none');

		}
	});

	$("#dashboardLink").click(function(){
		if(user.username) {
			$('#spinner2').show();
			$('#openTrades').hide();
			ws.send(JSON.stringify({type: "getAllParts", v: 2}));
			
		}
	});

	//login events
	$("#whoAmI").click(function(){													//drop down for login
		if($("#loginWrap").is(":visible")){
			$("#loginWrap").fadeOut();
		}
		else{
			$("#loginWrap").fadeIn();
		}
	});

	// Filter the trades whenever the filter modal changes
	$(".dashboard-filter").keyup(function() {
		"use strict";
		console.log("Change in filter detected.");
		processFilterForm(panels[0]);
	});

	var e = formatDate(new Date(), '%d/%M/%Y &nbsp;%I:%m%P');
	$("#blockdate").html('<span style="color:#D4DCDC">TIME</span>&nbsp;&nbsp;' + e + ' UTC');

	setInterval(function() {
		var e = formatDate(new Date(), '%d/%M/%Y &nbsp;%I:%m%P');
		$("#blockdate").html('<span style="color:#D4DCDC">TIME</span>&nbsp;&nbsp;' + e + ' UTC');

	}, 60000);

	$("#dashboardTable").on('click', 'tr', function() {
	    var bId = $(this).find('td:first').text() ;
	    ws.send(JSON.stringify({type: "getPart", partId: bId}));
	});

	$("#dashboardTablevehicles").on('click', 'tr', function() {
		var bId = $(this).find('td:first').text() ;
		if(bId == "" || bId.length != 20) return false;
	    ws.send(JSON.stringify({type: "getVehicle", vehicleId: bId}));
	});
	
});

//rest call to part to update the vin if part is added
function updatePartVin(_parts){	
	if(_parts && _parts.length > 0){
		var partDet = _parts.split(",")[0];
		if(partDet && partDet.length > 0){
			$.ajax({
				url : partsBlockChainUrl +'/updatePartDetails',
				type : 'POST',
				data: {
					partId: partDet.split('^')[0], 
					vin: $("input[name='upVin']").val(), 
					tranType: "PART_INSTALLED",
					vehicleId:"",dateOfDelivery:"",dateOfInstallation: moment().format("YYYY-MM-DD"),
					warrantyStartDate:moment().format("YYYY-MM-DD"),
					warrantyEndDate: moment().add("years",1).format("YYYY-MM-DD"), 
					owner:user.username 
				},
				dataType:'json',
				success : function(data) {              										
					if(data){
						if(_parts.indexOf(",") > -1){
							_parts = _parts.replace(partDet+",","");
						}
						else{
							_parts = _parts.replace(partDet,"");
						}
						if(_parts.length > 10){
							updatePartVin(_parts);
						}
					}
				},
				error : function(request,error)
				{
				}
			});
		}
	}
}

// =================================================================================
// Helper Fun
// =================================================================================
function escapeHtml(str) {
	var div = document.createElement('div');
	div.appendChild(document.createTextNode(str));
	return div.innerHTML;
};

// =================================================================================
// Socket Stuff
// =================================================================================
var connected = false;
var selectedParts;
function connect_to_server(){
	connect();
}
	function connect(){
		var wsUri = "";
		if(bag.setup.SERVER.EXTURI.indexOf("localhost") > -1){
			wsUri = "ws://" + bag.setup.SERVER.EXTURI;
		}
		else{
			wsUri = "wss://" + bag.setup.SERVER.EXTURI;
		}
		ws = new WebSocket(wsUri);
		ws.onopen = function(evt) { onOpen(evt); };
		ws.onclose = function(evt) { onClose(evt); };
		ws.onmessage = function(evt) { onMessage(evt); };
		ws.onerror = function(evt) { onError(evt); };
	}

	function onOpen(evt){
		console.log("WS CONNECTED");
		connected = true;
		clear_blocks();
		$("#errorNotificationPanel").fadeOut();
		motinotBlocks();		
		if(user.username && bag.session.user_role) {
			$('#spinner2').show();
			$('#openTrades').hide();
			ws.send(JSON.stringify({type: "getAllVehicles", v: 2}));
			//ws.send(JSON.stringify({type: "getAllParts", v: 2}));
			ws.send(JSON.stringify({type: "customerVehicle", v: 2}));
			$.ajax({
				url : partsBlockChainUrl +'/getAllParts', 				
				type : 'GET',
				dataType:'json',
				success : function(data) {              										
					build_Parts(data.parts, null);
				},
				error : function(request,error)
				{
					//alert("Request: "+JSON.stringify(request));
				}
			});
		}
	}

	function motinotBlocks(){
		ws.send(JSON.stringify({type: "chainstats", v:2}));
		setTimeout(function() {
			motinotBlocks();
		}, 1500);
	}

	function onClose(evt){
		console.log("WS DISCONNECTED", evt);
		connected = false;
		setTimeout(function(){ connect(); }, 5000);					//try again one more time, server restarts are quick
	}

	function onMessage(msg){
		try{
			var data = JSON.parse(msg.data);
			if(data.msg === 'allVehicles'){
				console.log("---- allVehicles ---- ", data);
				build_Vehicles(data.vehicles, null);
				$('#spinner2').hide();
				$('#openTrades').show();
			}
			else if(data.msg === 'allParts'){
				console.log("---- allParts ---- ", data);
				build_Parts(data.parts, null);
				$('#spinner2').hide();
				$('#openTrades').show();
			}
			else if(data.msg === 'customerVehicle'){
				console.log("-----onMessage customerVehicle----", data);
				//build_Vehicles(data.vehicles, null);
				$("#allVINs").empty();
				for(var i in data.vehicles){
					$("#allVINs").append('<option value="'+ data.vehicles[i].split("-")[0] +'" id="'+ data.vehicles[i] +'">'+  data.vehicles[i].split("-")[1] +" - "+ data.vehicles[i].split("-")[2] +'</option>')
				}
				console.log("First data from Vehicle List:  ", data.vehicles[0]);
				firstVehicleId = data.vehicles[0].split("-")[0];
				
				ws.send(JSON.stringify({type: "getCustomerVehicleDetails", vehicleId: firstVehicleId}));

				$('#spinner2').hide();
				$('#openTrades').show();	
				$("#allVINs").change(function(o){
					ws.send(JSON.stringify({type: "getCustomerVehicleDetails", vehicleId: $(this).val()}));
				});
			}	
			
			else if(data.msg === 'customerVehicleDetails'){
				console.log('----- onMessage customerVehicleDetails:', data.vehicle);			

				$("#customerVehicleDetailsTable").show();
				$("input[name='upVehicleId']").val(data.vehicle.vehicleId);
				$("input[name='upMake']").val(data.vehicle.make);
				//$("input[name='upChassisNumber']").val(data.vehicle.chassisNumber);
				$("input[name='upVin']").val(data.vehicle.vin);

				if(data.vehicle.owner.name !=""){
					var _ownerDisplayName = valid_customers.filter(function(_o){
						return _o.username == data.vehicle.owner.name;
					});
					$("input[name='upVehicleOwner']").val(_ownerDisplayName[0].displayname);
				}
				else{
					$("input[name='upVehicleOwner']").val(data.vehicle.owner.name);
				}
				
				$("input[name='upLicensePlateNumber']").val(data.vehicle.licensePlateNumber);
				$("input[name='upWarrantyStartDate']").val(moment(data.vehicle.warrantyStartDate).format("YYYY-MM-DD"));
				$("input[name='upWarrantyEndDate']").val(moment(data.vehicle.warrantyEndDate).format("YYYY-MM-DD"));
				$("input[name='upDateOfManufacture']").val(moment(data.vehicle.dateOfManufacture).format("YYYY-MM-DD"));
				$("input[name='upDateofDelivery']").val(data.vehicle.dateofDelivery);
				
				if(data.vehicle.dealer.name !=""){
					var _dealerDisplayName =  valid_dealers.filter(function(_o){
						return _o.username == data.vehicle.dealer.name;
					});
					if(_dealerDisplayName.length > 0)
						$("input[name='upDealer']").val(_dealerDisplayName[0].displayname);
				}
				else{
					$("input[name='upDealer']").val(data.vehicle.dealer.name);
				}

				$("#upVariant").html(data.vehicle.variant);
				$("#upEngine").html(data.vehicle.engine);
				$("#upGearBox").html(data.vehicle.gearBox);
				$("#upColor").html(data.vehicle.color);
				$("#cimg").attr("src", data.vehicle.image);

				// list parts
				var str = "";
                for(var i in data.vehicle.parts){
                    str += "<div style='padding-top: 4px;'><a style='color:blue;cursor:pointer;text-decoration:underline;' onclick=\"openPartDetailsPopup('"+ data.vehicle.parts[i].partId +"')\">"+ data.vehicle.parts[i].partId +"</a> - "+ data.vehicle.parts[i].partName +"</div>"
                }
                $("#upParts").html(str); 
				
				$(data.vehicle.vehicleTransactions).each(function(){
					if(this.ttype === "SERVICE_CENTER"){
						$("input[name='upLastServiceDate']").val(moment(this.updatedOn).format("YYYY-MM-DD"))
					}
				});

				//---- Service History Section
				var serv = data.vehicle.vehicleService;
				var servHtml="<table>";
				var _lastServDone ="";
				if (serv !=null){
					for(var i=0; i<serv.length; i++){
						var _serviceParts="";
						if(serv[i].parts!= null){
							for(var j=0; j<serv[i].parts.length; j++){
								if(_serviceParts == "")
									_serviceParts += serv[i].parts[j].partId;
								else
									_serviceParts +=", "+ serv[i].parts[j].partId;
							}
						}
						servHtml += '<tr>';
						servHtml += '<td style="text-align:left;">';
						servHtml +=	'<div style="display: inline-block; vertical-align: middle;">';
						servHtml += '<p style="font-weight:500;">Service done by <span style="color:#5596E6">' + serv[i].serviceDoneBy +'</span>';
						servHtml += 'on ' + moment(new Date(serv[i].serviceDoneOn)).format('lll') +'</p>';
						servHtml += '<p style="">Description: ' + serv[i].serviceDescription +'</p>';
						servHtml += '<p style="">Parts Added: ' + _serviceParts +'</p>';
						servHtml +=	'</div>';
						servHtml += '</td>';
						servHtml += '</tr>';
						_lastServDone = serv[i].serviceDoneOn;
					}
				}
				else if(serv == null || serv.length == 0){
					servHtml="<tr><td>No service history found.</td></tr>";
					//$("#upServiceHistory").html(servHtml).css({"height":"43px"});
					_lastServDone = moment(data.vehicle.warrantyStartDate);
				}
				 servHtml +="</table>";
				 $("#upServiceHistory").html(servHtml);

				if(moment(moment(_lastServDone).add(1, 'days').format("YYYY-MM-DD")) <= moment()){
					$("#divServiceDue").show();
					$("#msgServiceDue").html("Your service is due on "+ moment(_lastServDone).add(1, 'days').format("YYYY-MM-DD"));
				}
				else{
					$("#divServiceDue").hide();
				}
				$("input[name='upServiceDue']").val(moment(_lastServDone).add(1, 'days').format("YYYY-MM-DD"));

				$("input[name='upLastServiceDate'],input[name='upServiceDue'],input[name='upDealer'],input[name='upLicensePlateNumber'],input[name='upMake'],input[name='upVin'],input[name='upVehicleOwner'],input[name='upDateOfManufacture'],input[name='upLastServiceDate'],input[name='upWarrantyStartDate'],input[name='upWarrantyEndDate'],input[name='upDateofDelivery']")
				.css({'border': '0px','border-bottom': '0px solid #ccc','border-radius': '0px'});

			}
			else if(data.msg === 'allPartsForUpdateVehicle'){
				// console.log("---- allParts ---- ", data);
				// build_Parts(data.parts, null);
				// var str="<b style='font-weight:bold;text-decoration:underline;'>Add new Parts:</b></br>";
				// for(var i in data.parts){
				// 	str += "<span style='float:left; width: 80px;'><input type='checkbox' id='"+ data.parts[i] +"' class='part-un-selected' />"+ data.parts[i] +"</span>"
				// }
				// $("#upParts").html(str);
				// console.log(str);
			}
			else if(data.msg === 'vehicle'){

				if(data.vehicle.vehicleId === ""){
					$("#vehicleErrorMessage").show();
					$("#divVehicleErrorMessage").html("Vehicle not found");
					return false;
				}

				$("#batchDetailsTable").show();
				$("#vehicleDetailsTable").show();
				console.log(data.vehicle);
				var txs = data.vehicle.vehicleTransactions;
				var serv = data.vehicle.vehicleService;
				var html = ''
				$("#batchDetailsTable").show();
				console.log("Trnsaction "+i+" "+txs[i]);				
				$("#bDetHeader").html("Vin Number #" + data.vehicle.chassisNumber +"");
				selectedParts = data.vehicle.parts;

				// show vehicle details
				$("#vehicleDetailsTable").hide();				
				$("input[name='upVehicleId']").val(data.vehicle.vehicleId);
				$("input[name='upMake']").val(data.vehicle.make);
				//$("input[name='upChassisNumber']").val(data.vehicle.chassisNumber);
				$("input[name='upVin']").val(data.vehicle.vin);
				$("input[name='upLicensePlateNumber']").val(data.vehicle.licensePlateNumber);
				$("input[name='upWarrantyStartDate']").val(moment(data.vehicle.warrantyStartDate).format("YYYY-MM-DD"));
				$("input[name='upWarrantyEndDate']").val(moment(data.vehicle.warrantyEndDate).format("YYYY-MM-DD"));
				$("input[name='upDateOfManufacture']").val(moment(data.vehicle.dateOfManufacture).format("YYYY-MM-DD"));
				$("input[name='upDateofDelivery']").val(data.vehicle.dateofDelivery);
				if(data.vehicle.dealer.name != ""){
					var _dealerDisplayName =  valid_dealers.filter(function(_o){
						return _o.username == data.vehicle.dealer.name;
					});
					if(_dealerDisplayName.length > 0)
						$("input[name='upDealer']").val(_dealerDisplayName[0].displayname);				
				}
				else{
					$("input[name='upDealer']").val(data.vehicle.dealer.name);				
				}
				$("#upVariant").html(data.vehicle.variant);
				$("#upEngine").html(data.vehicle.engine);
				$("#upGearBox").html(data.vehicle.gearBox);
				$("#upColor").html(data.vehicle.color);
				$("#cimg").attr("src", data.vehicle.image);
				//("<img src='"+ data.vehicle.image +"'/>");
				//$("#carImage").css({"background-image": data.vehicle.image});
				//$($("#carImage").find("img")[0]).attr("src", data.vehicle.image);

				$("#allCustomers").empty().append('<option id=""></option>')
				for(var i in valid_customers){
					var _selected = "";
					if(data.vehicle.owner.name == valid_customers[i].username)
						_selected = "selected";
					$("#allCustomers").append('<option '+ _selected +' id="'+ valid_customers[i].username +'" value="'+ valid_customers[i].username +'">'+ valid_customers[i].displayname +'</option>')
				}
				//$('#allCustomers option[value="'+ data.vehicle.owner.name +'"]').attr('selected','selected');
				// list parts
				var str = "";
                for(var i in data.vehicle.parts){
                    str += "<div style='padding-top: 4px;'><a style='color:blue;cursor:pointer;text-decoration:underline;' onclick=\"openPartDetailsPopup('"+ data.vehicle.parts[i].partId +"')\">"+ data.vehicle.parts[i].partId +"</a> - "+ data.vehicle.parts[i].partName +"</div>"
                }
                $("#upParts").html(str); 
				
				$("#selectedParts").empty();
				$("#selectedParts").append('<option id="0">Added Parts</option>');
				for(var i in data.vehicle.parts){
					$("#selectedParts").append('<option id="'+ data.vehicle.parts[i].partId +'">'+ data.vehicle.parts[i].partId +'</option>')
				}

				$(data.vehicle.vehicleTransactions).each(function(){
					if(this.ttype === "SERVICE_CENTER"){
						$("input[name='upLastServiceDate']").val(moment(this.updatedOn).format("YYYY-MM-DD"))
					}
				});
				
				var servHtml="<table>";
				var _lastServDone ="";
				if (serv !=null){
					for(var i=0; i<serv.length; i++){
						var _serviceParts="";
						if(serv[i].parts!= null){
							for(var j=0; j<serv[i].parts.length; j++){
								if(_serviceParts == "")
									_serviceParts += serv[i].parts[j].partId;
								else
									_serviceParts +=", "+ serv[i].parts[j].partId;
							}
						}
						servHtml += '<tr>';
						servHtml += '<td style="text-align:left;">';
						servHtml +=	'<div style="display: inline-block; vertical-align: middle;">';
						servHtml += '<p style="font-weight:500;">Service done by <span style="color:#5596E6">' + serv[i].serviceDoneBy +'</span>';
						servHtml += 'on ' + moment(new Date(serv[i].serviceDoneOn)).format('lll') +'</p>';
						servHtml += '<p style="">Description: ' + serv[i].serviceDescription +'</p>';
						servHtml += '<p style="">Parts Added: ' + _serviceParts +'</p>';
						servHtml +=	'</div>';
						servHtml += '</td>';
						servHtml += '</tr>';
						_lastServDone = serv[i].serviceDoneOn;
					}
				}
				else if(serv == null || serv.length == 0){
					servHtml="<tr><td>No service history found.</td></tr>";
					//$("#upServiceHistory").html(servHtml).css({"height":"43px"});
					_lastServDone = moment(data.vehicle.warrantyStartDate);
				}
				 servHtml +="</table>";
				 $("#upServiceHistory").html(servHtml);

				if(moment(moment(_lastServDone).add(1, 'days').format("YYYY-MM-DD")) <= moment()){
					$("#divServiceDue").show();
					$("#msgServiceDue").html("Service is due on "+ moment(_lastServDone).add(1, 'days').format("YYYY-MM-DD"));
				}
				else{
					$("#divServiceDue").hide();
				}
				$("input[name='upServiceDue']").val(moment(_lastServDone).add(1, 'days').format("YYYY-MM-DD"));


				for(var i=0; i<txs.length; i++){
					
					if(txs[i].ttype == "CREATE"){
			          //litem = {avatar:"ion-ios-box-outline", date: tx.vDate, location: tx.location, desc:"ADDED BY ", owner:tx.owner};
				        html += '<tr>';
						html += '<td style="text-align:left;">';
						html +=	'<div style="display: inline-block; vertical-align: middle;">';
						html += '<p style="font-weight:500;">ADDED BY <span style="color:#5596E6">' + txs[i].updatedBy +'</span></p>';
						html += '<p style="">on ' + moment(new Date(txs[i].updatedOn)).format('lll') +'</p>';
						html +=	'</div>';
						html += '</td>';
						html += '</tr>';
					}
					else if(txs[i].ttype == "DEALER"){
					  //litem = {avatar:"ion-ios-barcode-outline", date: data.batch.vDate, location: data.batch.location, desc:"PICKED UP BY ", owner:data.batch.owner};
						var updateStr = "";
						$(txs[i].tvalue.split(",")).each(function(){
							if(this != ""){
								updateStr += "<div style='margin-left:2px;padding: 3px;'>"+ this +"</div>";
							}
						});
			        	html += '<tr>';
						html += '<td style="text-align:left;">';
						html +=	'<div style="display: inline-block; vertical-align: middle;">';
						html += '<p style="font-weight:500;">Added/Updated '+ updateStr +'&nbsp;By <span style="color:#5596E6">' + txs[i].updatedBy +'</span></p>';
						html += '<p style="margin-left:4px;">on ' + moment(new Date(txs[i].updatedOn)).format('lll') +'</p>';
						html +=	'</div>';
						html += '</td>';
						html += '</tr>';
					}
					else if(txs[i].ttype == "SERVICE_CENTER"){
						var updateStr = "";
						$(txs[i].tvalue.split(",")).each(function(){
							if(this != ""){
								if(this.indexOf("Parts:") > -1){
									$(this.split("~")).each(function(){
										if(this != ""){
											updateStr += "<div style='margin-left:2px;padding: 3px;'>"+ this.replace("Updated","Replaced") +"</div>";
										}
									});									
								}
								else{
									updateStr += "<div style='margin-left:2px;padding: 3px;'>"+ this +"</div>";
								}
							}
						});
			        	html += '<tr>';
						html += '<td style="text-align:left;">';
						html +=	'<div style="display: inline-block; vertical-align: middle;">';
						html += '<p style="font-weight:500;">SERVICE DONE BY <span style="color:#5596E6">' + txs[i].updatedBy +'</span></p>';
						html += '<p style="">' + updateStr +'</p>';
						html += '<p style="margin-left:4px;">on ' + moment(new Date(txs[i].updatedOn)).format('lll') +'</p>';
						html +=	'</div>';
						html += '</td>';
						html += '</tr>';
			        }
			        else if(txs[i].ttype == "DELIVERY"){
			          //litem = {avatar:"ion-ios-barcode-outline", date: data.batch.vDate, location: data.batch.location, desc:"PICKED UP BY ", owner:data.batch.owner};
			        	html += '<tr>';
						html += '<td style="text-align:left;">';
						html +=	'<div style="display: inline-block; vertical-align: middle;">';
						html += '<p style="font-weight:500;">DELIVERED TO <span style="color:#5596E6">' + txs[i].user +'</span></p>';
						html += '<p style="">on ' + txs[i].dateOfDelivery +'</p>';
						html +=	'</div>';
						html += '</td>';
						html += '</tr>';
			        }
			        else if(txs[i].ttype == "INSTALLED"){
			          //litem = {avatar:"ion-ios-shuffle", date: data.batch.vDate, location: data.batch.location, desc:"DELIVERED TO ", owner:data.batch.owner};
			        	html += '<tr>';
						html += '<td style="text-align:left;">';
						html +=	'<div style="display: inline-block; vertical-align: middle;">';
						html += '<p style="font-weight:500;">PART INSTALLED BY <span style="color:#5596E6">' + txs[i].user +'</span></p>';
						html += '<p style="">on ' + txs[i].dateOfInstallation +'</p>';
						html += '<p style="">Vehicle ID: ' + txs[i].vehicleId +'</p>';
						html += '<p style="">Warranty Start Date:' + txs[i].warrantyStartDate +'</p>';
						html += '<p style="">Warranty End Date:' + txs[i].warrantyEndDate +'</p>';
						html +=	'</div>';
						html += '</td>';
						html += '</tr>';
			        }
				}

				$("#vehiclesbatchDetailsBody").html(html);
			}
			else if(data.msg === 'part'){
				console.log('onMessage part:'+data.part);
				var txs = data.part.transactions;
				var html = ''
				$("#batchDetailsTable").show();
				for(var i=0; i<txs.length; i++){
					console.log("Trnsaction "+i+" "+txs[i]);
					$("#bDetHeader").html("<p>PART Id: " + data.part.partId + " (" + data.part.partName + ")</p>");
					html += formatPartTransactions(txs[i], data);
				}

				$("#batchDetailsBody").html(html);
			}
			else if(data.msg === 'chainstats'){
				if(data.blockstats.transactions)
				{
					var e = formatDate(data.blockstats.transactions[0].timestamp.seconds * 1000, '%M/%d/%Y &nbsp;%I:%m%P');
					//$("#blockdate").html('<span style="color:#fff">LAST BLOCK</span>&nbsp;&nbsp;' + e + ' UTC');
					var temp = {
									id: data.blockstats.height,
									blockstats: data.blockstats
								};
					new_block(temp);
				}									//send to blockchain.js
			}
			else if(data.msg === 'blockChain'){
				$(data.blocks).each(function(b){
					var temp = {
						id: this.block_id,
						blockstats: this
					};
					new_block(temp);
				});
			}
			else if (data.msg === 'newBlock') {
				var temp = {
					id: data.block_id,
					blockstats: data
				};
				new_block(temp);											// send to blockchain.js
			}
			else if(data.msg === 'vehicleCreated'){
				$("#notificationPanel").animate({width:'toggle'});
				$($("#noticeText").find('p')[0]).html("Your Vehicle has been created.");
				$("#notificationPanel").show();
				$('#spinner').hide();
				$('#tagWrapper').show();	
				
				$("#vehicleList").click();
				$("#vehicleDashboardPanel").show();
				setTimeout(function() {
					ws.send(JSON.stringify({type: "getAllVehicles", v: 2}));				
				}, 2000);
				
			}
			else if(data.msg === 'vehicleUpdated'){
				$("#notificationPanel").animate({width:'toggle'});
				$($("#noticeText").find('p')[0]).html("Your Vehicle has been updated.");
				$("#notificationPanel").show();
				$('#spinner').hide();
				$('#tagWrapper').show();
				$("#vehicleDashboardPanel").show();
				setTimeout(function() {
					ws.send(JSON.stringify({type: "getAllVehicles", v: 2}));				
				}, 2000);	
				
				$("#batchDetailsTable, #vehicleDetailsTable").hide();
				$("#scVin").val("");
			}
			else if(data.msg === 'partCreated'){
				$("#notificationPanel").animate({width:'toggle'});
				$($("#noticeText").find('p')[0]).html("Your Part has been created.");
				$("#notificationPanel").show();				
				$('#spinner').hide();
				$('#tagWrapper').show();
			}
			else if(data.msg === 'partUpdated'){
				$("#updateNotificationPanel").animate({width:'toggle'});
				$($("#noticeText").find('p')[0]).html("Your Part has been updated.");
				$("#notificationPanel").show();				
				$('#spinner').hide();
				$('#tagWrapper').show();
			}
			else if(data.msg === 'reset'){
				if(user.username && bag.session.user_role && bag.session.user_role.toUpperCase() === "dealer".toUpperCase()) {
					$('#spinner2').show();
					$('#openTrades').hide();
					ws.send(JSON.stringify({type: "getAllParts", v: 2}));
				}
			}
		}
		catch(e){
			console.log('ERROR', e);
			//ws.close();
		}		
	}

	function onError(evt){
		console.log('ERROR ', evt);
		if(!connected && bag.e == null){											//don't overwrite an error message
			$("#errorName").html("Warning");
			$("#errorNoticeText").html("Waiting on the node server to open up so we can talk to the blockchain. ");
			$("#errorNoticeText").append("This app is likely still starting up. ");
			$("#errorNoticeText").append("Check the server logs if this message does not go away in 1 minute. ");
			$("#errorNotificationPanel").fadeIn();
		}
	}

	function sendMessage(message){
		console.log("SENT: " + message);
		ws.send(message);
	}

function openPartDetailsPopup(_partId){	
	  $($(".ui-dialog-buttonset").find("button")[0]).hide();
	  $("#popup-part-header").html("");
	  $("#popup-part-details").html("");
	  $.ajax({
		url : partsBlockChainUrl +'/getPart/'+ _partId,
		type : 'GET',				
		dataType:'json',
		success : function(data) {              										
			if(data){
				//validate if this part is installed in another machine.
				var tx = data.transactions;
				//show the part details
				var _headerDetails = "<p><span>Part Id: </span>"+ data.partId +" ("+ data.partName +")</p>";
				//_headerDetails+= "<p><span>Part Code: </span>"+ data.partCode +"</p>";
				//_headerDetails+= "<p><span>Part Type: </span>"+ data.partType +"</p>";
				//_headerDetails+= "<p><span>Part Name: </span>"+ data.partName +"</p>";
				//_headerDetails+= "<p><span>Description: </span>"+ data.description +"</p>";
				$("#popup-part-header").html(_headerDetails);

				var _txDetails = "";
				_txDetails += "<p class='ui-dialog-title ui-popup-grid-header'>Transactions: </p>";
				_txDetails += "<table class='part-transactions-popup'>";
				for(var vi=0;vi<tx.length;vi++){
					_txDetails += formatPartTransactions(tx[vi], {part: data});
				}
				_txDetails += "</table>";
				_txDetails += "<input type='hidden' id='hdnSelectedPartCode' value='"+ data.partCode +"'>";
				_txDetails += "<input type='hidden' id='hdnSelectedPartType' value='"+ data.partType +"'>";
				_txDetails += "<input type='hidden' id='hdnSelectedPartName' value='"+ data.partName +"'>";
				$("#popup-part-details").html(_txDetails);

				$( "#dialog-confirm" ).dialog({
					resizable: false,
					height: "auto",
					width: 600,
					dialogClass: 'fixed-dialog', 
					modal: true,
					buttons: {
					  "OK": function() {
						$( this ).dialog( "close" );
					  }
					}
				  });
			}
			else{
				$("#popup-part-details").html("The selected part '"+ $("input[name='upPartId']").val() +"' is not valid.");					
			}
		},
		error : function(request,error)
		{
			$("#popup-part-details").html("<div style='font-size:20px;text-align:left;'>The selected part '"+$("input[name='upPartId']").val() +"' is not valid.</div>");
		}
	  });
}

function formatPartTransactions(tx, data){
	var html="";
	if(tx.ttype == "CREATE"){
		html += '<tr>';
		html += '<td style="text-align:left;">';
		html +=	'<div style="display: inline-block; vertical-align: middle;">';
		html += '<p style="font-weight:500;">ADDED BY <span style="color:#5596E6">' + tx.user +'</span></p>';
		html += '<p style="">on ' + tx.dateOfManufacture +'</p>';
		html += '<p style="">Part Code: ' + data.part.partCode +'</p>';
		html += '<p style="">Batch Code: ' + data.part.batchCode +'</p>';
		html += '<p style="">Part Type: ' + data.part.partType +'</p>';		
		html += '<p style="">Part Name: ' + data.part.partName +'</p>';
		html += '<p style="">Description: ' + data.part.description +'</p>';
		
		html +=	'</div>';
		html += '</td>';
		html += '</tr>';
	}
	else if(tx.ttype == "DELIVERY"){
	  //litem = {avatar:"ion-ios-barcode-outline", date: data.batch.vDate, location: data.batch.location, desc:"PICKED UP BY ", owner:data.batch.owner};
		html += '<tr>';
		html += '<td style="text-align:left;">';
		html +=	'<div style="display: inline-block; vertical-align: middle;">';
		html += '<p style="font-weight:500;">DELIVERED TO <span style="color:#5596E6">' + tx.user +'</span></p>';
		html += '<p style="">on ' + tx.dateOfDelivery +'</p>';
		html +=	'</div>';
		html += '</td>';
		html += '</tr>';
	}
	else if(tx.ttype == "INSTALLED"){
	  //litem = {avatar:"ion-ios-shuffle", date: data.batch.vDate, location: data.batch.location, desc:"DELIVERED TO ", owner:data.batch.owner};
		html += '<tr>';
		html += '<td style="text-align:left;">';
		html +=	'<div style="display: inline-block; vertical-align: middle;">';
		html += '<p style="font-weight:500;">PART INSTALLED BY <span style="color:#5596E6">' + tx.user +'</span></p>';
		html += '<p style="">on ' + tx.dateOfInstallation +'</p>';
		html += '<p style="">Vehicle ID: ' + tx.vehicleId +'</p>';
		html += '<p style="">Warranty Start Date:' + tx.warrantyStartDate +'</p>';
		html += '<p style="">Warranty End Date:' + tx.warrantyEndDate +'</p>';
		html +=	'</div>';
		html += '</td>';
		html += '</tr>';
	}
	else if(tx.ttype == "PART_INSTALLED"){
		  html += '<tr>';
		  html += '<td style="text-align:left;">';
		  html +=	'<div style="display: inline-block; vertical-align: middle;">';
		  html += '<p style="font-weight:500;">PART INSTALLED BY <span style="color:#5596E6">' + tx.user +'</span></p>';
		  html += '<p style="">on ' + tx.dateOfInstallation +'</p>';
		  html += '<p style="">Vehicle Vin: ' + tx.vin +'</p>';
		  html +=	'</div>';
		  html += '</td>';
		  html += '</tr>';
	}
	return html;
}

// =================================================================================
//	UI Building
// =================================================================================
function build_Vehicles(vehicles, panelDesc){
	var html = '';
	bag.vehicles = vehicles;
	// If no panel is given, assume this is the trade panel
	if(!panelDesc) {
		panelDesc = panels[0];
	}
	allVehicles = [];
	for(var i in vehicles){
		console.log('!', vehicles[i]);
		allVehicles[i] = vehicles[i];
		if(excluded(vehicles[i], filter)) {

			// Create a row for each batch
			html += '<tr id="vehicledashboardTableRow" style="cursor:pointer;">';
			html +=		'<td style="display:none;">' + vehicles[i].split("-")[0] + '</td>';
			html +=		'<td>' + vehicles[i].split("-")[1] + '</td>';
			html += '</tr>';

		}
	}

	// Placeholder for an empty table
	if(html == '' && panelDesc.name === "dashboard") html = '<tr><td>Nothing here...</td></tr>';
	console.log(html);
	$("#vehicledashboardBody").html(html);
}

function build_Parts(parts, panelDesc){
	var html = '';
	bag.parts = parts;
	// If no panel is given, assume this is the trade panel
	if(!panelDesc) {
		panelDesc = panels[0];
	}
	allParts = [];
	for(var i in parts){
		console.log('!', parts[i]);
		allParts[i] = parts[i];
		if(excluded(parts[i], filter)) {

			// Create a row for each batch
			html += '<tr>';
			html +=		'<td>' + parts[i] + '</td>';
			html += '</tr>';

		}
	}

	// Placeholder for an empty table
	if(html == '' && panelDesc.name === "dashboard") html = '<tr><td>Nothing here...</td></tr>';

	$(panelDesc.tableID).html(html);
}

// =================================================================================
//	Helpers for the filtering of trades
// =================================================================================
var filter = {};

/**
 * Describes all the fields that describe a trade.  Used to create
 * a filter that can be used to control which trades get shown in the
 * table.
 * @type {string[]}
 */
var names = [
	"partId"
];

/**
 * Parses the filter forms in the UI into an object for filtering
 * which trades are displayed in the table.
 * @param panelDesc An object describing which panel
 */
function processFilterForm(panelDesc) {
	"use strict";

	var form = document.forms[panelDesc.formID];

	console.log("Processing filter form");

	// Reset the filter parameters
	filter = {};

	// Build the filter based on the form inputs
	for (var i in names) {

		var name = names[i];
		var id = panelDesc.filterPrefix + name;
		if(form[id] && form[id].value !== "") {
			filter[name] = form[id].value;
		}
	}

	console.log("New filter parameters: " + JSON.stringify(filter));
	console.log("Rebuilding list");
	build_Parts(bag.parts, panelDesc);
}

/**
 * Validates a trade object against a given set of filters.
 * @param part The object to be validated.
 * @param filter The filter object to validate the trade against.
 * @returns {boolean} True if the trade is valid according to the filter, false otherwise.
 */
function excluded(part, filter) {
	"use strict";

	if(filter.partId && filter.partId!== "" && part.toUpperCase().indexOf(filter.partId.toUpperCase()) == -1 ) return false;

	// Must be a valid trade if we reach this point
	return true;
}
