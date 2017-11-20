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
var user = {username: bag.session.username};
var valid_users = ["SKF", "BOSCH", "STAHLGRUBER", "MMW"];
var allParts = [];
var panels = [
	{
		name: "dashboard",
		formID: "dashboardFilter",
		tableID: "#dashboardBody",
		filterPrefix: "dashboard_"
	}
];
var lastTx = ''

// =================================================================================
// On Load
// =================================================================================
$(document).on('ready', function() {
	// user.username = "SKF";
	// bag.session.user_role="SERVICE_CENTER";
	connect_to_server();
	if(user.username)
	{
		$("#userField").html(user.username+ ' ');
	}

	// Customize which panels show up for which user
	$(".nav").hide();
	//console.log("user role", bag.session.user_role);

	// Only show tabs if a user is logged in
	if(user.username) {
		// Display tabs based on user's role
		if(bag.session.user_role && bag.session.user_role.toUpperCase() === "DEALER") {
			$("#dashboardLink").show();
			$("#dashboardPanel").show();
			$("#updatePartLink").show();
			$("#newPartLink").hide();
			$("#newPartPanel").hide();
			$("#batchDetailsTable").hide();
			

		}
		else if (user.username==="SERVICE_CENTER" || bag.session.user_role.toUpperCase() === "SERVICE_CENTER"){
			$("#dashboardLink").show();
			$("#dashboardPanel").show();
			$("#updatePartLink").show();
			$("#newPartLink").show();
			$("#newPartPanel").show();
			$("#batchDetailsTable").show();			
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

	// =================================================================================
	// jQuery UI Events
	// =================================================================================
	/*$("#generate").click(function(){
		if(user.username){
			$("input[name='PartId']").val(randStr(15).toUpperCase());

			$("input[name='Date']").val(formatDate(new Date(), '%d-%M-%Y %I:%m%p'));
			$("input[name='Quantity']").val(10);

			$("#submit").removeAttr("disabled");
		}

		return false;
	});*/

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

});


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
function connect_to_server(){
	var connected = false;
	connect();

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
		ws.send(JSON.stringify({type: "chainstats", v:2}));
		if(user.username && bag.session.user_role) {
			$('#spinner2').show();
			$('#openTrades').hide();
			ws.send(JSON.stringify({type: "getAllParts", v: 2}));
		}

	}

	function onClose(evt){
		console.log("WS DISCONNECTED", evt);
		connected = false;
		setTimeout(function(){ connect(); }, 5000);					//try again one more time, server restarts are quick
	}

	function onMessage(msg){
		try{
			var data = JSON.parse(msg.data);

			if(data.msg === 'allParts'){
				console.log("---- allParts ---- ", data);
				build_Parts(data.parts, null);
				$('#spinner2').hide();
				$('#openTrades').show();
			}
			else if(data.msg === 'part'){
				console.log('onMessage part:'+data.part);
				var txs = data.part.transactions;
				var html = ''
				$("#batchDetailsTable").show();
				for(var i=0; i<txs.length; i++){
					console.log("Trnsaction "+i+" "+txs[i]);
					$("#bDetHeader").html("PART #" + data.part.partId + ' - <span style="font-size:16px;font-weight:500">' + data.part.productCode + '</span>');


					if(txs[i].ttype == "CREATE"){
			          //litem = {avatar:"ion-ios-box-outline", date: tx.vDate, location: tx.location, desc:"ADDED BY ", owner:tx.owner};
				        html += '<tr>';
						html +=	'<td>';
						html +=	'<div style="font-size: 34px;color:#5596E6;float:right;"><i class="icon ion-ios-box-outline"></i></div>';
						html += '</td>';
						html += '<td style="text-align:left;padding-left:20px">';
						html +=	'<div style="display: inline-block; vertical-align: middle;">';
						html += '<p style="font-weight:500;">ADDED BY <span style="color:#5596E6">' + txs[i].user +'</span></p>';
						html += '<p style="">on ' + txs[i].dateOfManufacture +'</p>';
						html +=	'</div>';
						html += '</td>';
						html += '</tr>';
			        }
			        else if(txs[i].ttype == "DELIVERY"){
			          //litem = {avatar:"ion-ios-barcode-outline", date: data.batch.vDate, location: data.batch.location, desc:"PICKED UP BY ", owner:data.batch.owner};
			        	html += '<tr>';
						html +=	'<td>';
						html +=	'<div style="font-size: 34px;color:#5596E6;float:right;"><i class="ion-ios-shuffle"></i></div>';
						html += '</td>';
						html += '<td style="text-align:left;padding-left:20px">';
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
						html +=	'<td>';
						html +=	'<div style="font-size: 34px;color:#5596E6;float:right;"><i class="ion-ios-barcode-outline"></i></div>';
						html += '</td>';
						html += '<td style="text-align:left;padding-left:20px">';
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
			else if(data.msg === 'partCreated'){
				$("#notificationPanel").animate({width:'toggle'});
				$('#spinner').hide();
				$('#tagWrapper').show();
			}
			else if(data.msg === 'partUpdated'){
				$("#updateNotificationPanel").animate({width:'toggle'});
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
}


// =================================================================================
//	UI Building
// =================================================================================
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
