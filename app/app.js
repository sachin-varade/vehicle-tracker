"use strict";

var express = require("express");
var session = require("express-session");
var compression = require("compression");
var serve_static = require("serve-static");
var path = require("path");
var morgan = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var http = require("http");
var app = express();
var url = require("url");
var async = require("async");
var setup = require("./setup");
var cors = require("cors");
var fs = require("fs");
var parseCookie =cookieParser("Somethignsomething1234!test");
var sessionStore = new session.MemoryStore();
var ws = require('ws');											//websocket module 
var winston = require('winston');								//logger module

var host = setup.SERVER.HOST;
var port = setup.SERVER.PORT;

console.log("app running on "+ host + "----"+ port);

var logger = new (winston.Logger)({
	level: 'debug',
	transports: [
		new (winston.transports.Console)({ colorize: true }),
	]
});

//FOR LOCAL
process.env["creds_filename"]="app_local.json";
var misc = require('./utils/misc.js')(logger);					//random non-blockchain related functions
misc.check_creds_for_valid_json();
var helper = require(__dirname + '/utils/helper.js')("app_local.json", logger);				//parses our blockchain config file
//FOR BLUEMIX
//var helper = require(__dirname + '/utils/helper.js')(process.env.creds_filename, logger);				//parses our blockchain config file

var fcw = require('./utils/fc_wrangler/index.js')({ block_delay: helper.getBlockDelay() }, logger);		//fabric client wrangler wraps the SDK

var enrollObj = null;
var app_lib = null;
var wss = {};
var start_up_states = {												//app Startup Steps
	checklist: { state: 'waiting', step: 'step1' },					// Step 1 - check config files for somewhat correctness
	enrolling: { state: 'waiting', step: 'step2' },					// Step 2 - enroll the admin
	find_chaincode: { state: 'waiting', step: 'step3' },			// Step 3 - find the chaincode on the channel	
};

////////  Pathing and Module Setup  ////////
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
app.engine(".html", require("jade").__express);
app.use(compression());
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded()); 
app.use(parseCookie);
app.use( serve_static(path.join(__dirname, "public"), {maxAge: "1d", setHeaders: setCustomCC}) );							//1 day cache
//app.use( serve_static(path.join(__dirname, 'public')) );
app.use(session({secret:"Somethignsomething1234!test", resave:true, saveUninitialized:true, store: sessionStore}));

function setCustomCC(res, path) {
	if (serve_static.mime.lookup(path) === "image/jpeg")  res.setHeader("Cache-Control", "public, max-age=2592000");		//30 days cache
	else if (serve_static.mime.lookup(path) === "image/png") res.setHeader("Cache-Control", "public, max-age=2592000");
	else if (serve_static.mime.lookup(path) === "image/x-icon") res.setHeader("Cache-Control", "public, max-age=2592000");
}
// Enable CORS preflight across the board.
app.options("*", cors());
app.use(cors());

//// Router ////
var router = require("./routes/site_router");
app.use("/", router);
var wsInteraction = require("./utils/wsInteraction");

///////////  Configure Webserver  ///////////
app.use(function(req, res, next){
	var keys;
	console.log("------------------------------------------ incoming request ------------------------------------------");
	console.log("New " + req.method + " request for", req.url);
	req.bag = {};											//create my object for my stuff
	req.session.count = eval(req.session.count) + 1;
	req.bag.session = req.session;
	
	var url_parts = url.parse(req.url, true);
	req.parameters = url_parts.query;
	keys = Object.keys(req.parameters);
	if(req.parameters && keys.length > 0) console.log({parameters: req.parameters});		//print request parameters
	keys = Object.keys(req.body);
	if (req.body && keys.length > 0) console.log({body: req.body});						//print request body
	next();
});

////////////////////////////////////////////
////////////// Error Handling //////////////
////////////////////////////////////////////
app.use(function(req, res, next) {
	var err = new Error("Not Found");
	err.status = 404;
	next(err);
});
app.use(function(err, req, res, next) {		// = development error handler, print stack trace
	console.log("Error Handeler -", req.url);
	var errorCode = err.status || 500;
	res.status(errorCode);
	req.bag.error = {msg:err.stack, status:errorCode};
	if(req.bag.error.status == 404) req.bag.error.msg = "Sorry, I cannot locate that file";
	res.render("template/error", {bag:req.bag});
});

// ============================================================================================================================
// 														Launch Webserver
// ============================================================================================================================
var server = http.createServer(app);//.listen(port, host, function() {console.log("creer serveur(((((((((((((((((((((((((((((((-");});
server.listen(port, function listening() {
	console.log("Listening on %d", server.address().port);
});
//var server = http.createServer(app).listen(port, '192.168.1.2');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
process.env.NODE_ENV = "production";
server.timeout = 240000;																							// Ta-da.
console.log("------------------------------------------ Server Up - " + host + ":" + port + " ------------------------------------------");
if(process.env.PRODUCTION) console.log("Running using Production settings");
else console.log("Running using Developer settings");

// ============================================================================================================================
// 														Warning
// ============================================================================================================================

// ============================================================================================================================
// 														Entering
// ============================================================================================================================

// ============================================================================================================================
// 														Test Area
// ============================================================================================================================

// ------------------------------------------------------------------------------------------------------------------------------
// Life Starts Here!
// ------------------------------------------------------------------------------------------------------------------------------

process.env.app_first_setup = 'yes';				//init
let config_error = helper.checkConfig();

setupWebSocket();

if (config_error) {
	broadcast_state('checklist', 'failed');			//checklist step is done
} else {
	broadcast_state('checklist', 'success');		//checklist step is done
	console.log('\n');
	logger.info('Using settings in ' + process.env.creds_filename + ' to see if we have launch app before...');

	// --- Go Go Enrollment --- //
	enroll_admin(1, function (e) {
		if (e != null) {
			logger.warn('Error enrolling admin');
			broadcast_state('enrolling', 'failed');
			startup_unsuccessful();
		} else {
			logger.info('Success enrolling admin');
			broadcast_state('enrolling', 'success');
			startup_unsuccessful();
			// --- Setup app Library --- //
			setup_app_lib(function () {
			});
		}
	});
}

// Wait for the user to help correct the config file so we can startup!
function startup_unsuccessful() {
	process.env.app_first_setup = 'yes';
	console.log('');
	logger.info('Detected that we have NOT launched successfully yet');
	logger.debug('Open your browser to http://' + host + ':' + port + ' and login as "admin" to initiate startup\n\n');
	// we wait here for the user to go the browser, then setup_app_lib() will be called from WS msg
}

// // Find if app has started up successfully before
// function detect_prev_startup(opts, cb) {
// 	logger.info('Checking ledger for app owners listed in the config file');
// 	app_lib.read_everything(null, function (err, resp) {			//read the ledger for app owners
// 		if (err != null) {
// 			logger.warn('Error reading ledger');
// 			if (cb) cb(true);
// 		} else {
// 			if (find_missing_owners(resp)) {							//check if each user in the settings file has been created in the ledger
// 				logger.info('We need to make app owners');			//there are app owners that do not exist!
// 				broadcast_state('register_owners', 'waiting');
// 				if (cb) cb(true);
// 			} else {
// 				broadcast_state('register_owners', 'success');			//everything is good
// 				process.env.app_first_setup = 'no';
// 				logger.info('Everything is in place');
// 				if (cb) cb(null);
// 			}
// 		}
// 	});
// }

//setup app library and check if cc is instantiated
function setup_app_lib(cb) {
	var opts = helper.makeAppLibOptions();
	app_lib = require('./utils/app_cc_lib.js')(enrollObj, opts, fcw, logger);
	//ws_server.setup(wss.broadcast, app_lib);
	wsInteraction.setup(wss.broadcast, app_lib);

	logger.debug('Checking if chaincode is already instantiated or not');
	const channel = helper.getChannelId();
	const first_peer = helper.getFirstPeerName(channel);
	var options = {
		peer_urls: [helper.getPeersUrl(first_peer)],
	};
	app_lib.check_if_already_instantiated(options, function (not_instantiated, enrollUser) {
		if (not_instantiated) {									//if this is truthy we have not yet instantiated.... error
			console.log('');
			logger.debug('Chaincode was not detected: "' + helper.getChaincodeId() + '", all stop');
			logger.debug('Open your browser to http://' + host + ':' + port + ' and login to tweak settings for startup');
			process.env.app_first_setup = 'yes';				//overwrite state, bad startup
			broadcast_state('find_chaincode', 'failed');
		}
		else {													//else we already instantiated
			console.log('\n----------------------------- Chaincode found on channel "' + helper.getChannelId() + '" -----------------------------\n');
		}
	});
}

// Enroll an admin with the CA for this peer/channel
function enroll_admin(attempt, cb) {
	fcw.enroll(helper.makeEnrollmentOptions(0), function (errCode, obj) {
		if (errCode != null) {
			logger.error('could not enroll...');

			// --- Try Again ---  //
			if (attempt >= 2) {
				if (cb) cb(errCode);
			} else {
				removeKVS();
				enroll_admin(++attempt, cb);
			}
		} else {
			enrollObj = obj;
			if (cb) cb(null);
		}
	});
}

// Clean Up OLD KVS
function removeKVS() {
	try {
		logger.warn('removing older kvs and trying to enroll again');
		misc.rmdir(helper.getKvsPath({ going2delete: true }));			//delete old kvs folder
		logger.warn('removed older kvs');
	} catch (e) {
		logger.error('could not delete old kvs', e);
	}
}

// Message to client to communicate where we are in the start up
function build_state_msg() {
	return {
		msg: 'app_state',
		state: start_up_states,
		first_setup: process.env.app_first_setup
	};
}

// Send to all connected clients
function broadcast_state(change_state, outcome) {
	try {
		start_up_states[change_state].state = outcome;
		wss.broadcast(build_state_msg());								//tell client our app state
	} catch (e) { }														//this is expected to fail for "checking"
}

// ============================================================================================================================
// 												WebSocket Communication Madness
// ============================================================================================================================
function setupWebSocket() {
	console.log('------------------------------------------ Websocket Up ------------------------------------------');
	wss = new ws.Server({ server: server });								//start the websocket now
	wss.on('connection', function connection(ws) {
		
		ws.on('message', function incoming(message) {
			console.log(' ');
			console.log('-------------------------------- Incoming WS Msg --------------------------------');
			logger.debug('[ws] received ws msg:', message);
			var data = null;
			try {
				data = JSON.parse(message);
			}
			catch (e) {
				logger.debug('[ws] message error', message, e.stack);
			}
			if (data && data.type == 'setup') {
				logger.debug('[ws] setup message', data);

				//enroll admin
				if (data.configure === 'enrollment') {
					removeKVS();
					helper.write(data);													//write new config data to file
					enroll_admin(1, function (e) {
						if (e == null) {
							setup_app_lib(function () {
							});
						}
					});
				}

				//find instantiated chaincode
				else if (data.configure === 'find_chaincode') {
					helper.write(data);													//write new config data to file
					enroll_admin(1, function (e) {										//re-enroll b/c we may be using new peer/order urls
						if (e == null) {
							setup_app_lib(function () {
							});
						}
					});
				}				
			}
			else if (data) {
				parseCookie(ws.upgradeReq, null, function(err) {
			        var sessionID = ws.upgradeReq.signedCookies["connect.sid"];
			        sessionStore.get(sessionID, function(err, sess) {
				    	if(sess){
				    		wsInteraction.process_msg(ws, data, sess.username);
				    	}
				    });
			    }); 
			}
		});

		ws.on('error', function (e) { logger.debug('[ws] error', e); });
		ws.on('close', function () { logger.debug('[ws] closed'); });
		ws.send(JSON.stringify(build_state_msg()));							//tell client our app state
	});

	// --- Send To All Connected Clients --- //
	wss.broadcast = function broadcast(data) {
		var i = 0;
		wss.clients.forEach(function each(client) {
			try {
				logger.debug('[ws] broadcasting to clients. ', (++i), data.msg);
				client.send(JSON.stringify(data));
			}
			catch (e) {
				logger.debug('[ws] error broadcast ws', e);
			}
		});
	};
}
