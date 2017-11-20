/* global __dirname */
/*eslint-env node */
"use strict";
/* global process */
/*******************************************************************************
 * Copyright (c) 2015 IBM Corp.
 *
 * All rights reserved. 
 *
 * Contributors:
 *   David Huffman - Initial implementation
 *******************************************************************************/
var express = require("express");
var router = express.Router();
var fs = require("fs");
var setup = require("../setup.js");
var path = require("path");
var ibc = {};
var chaincode = {};
var ibc_parts = {};
var chaincode_parts = {};

var async = require("async");

// Load our modules.
//var aux     = require("./site_aux.js");

var creds	= require("../user_creds.json");


// ============================================================================================================================
// Home
// ============================================================================================================================
router.route("/").get(function(req, res){
	check_login(res, req);
	res.render("vehicle", {title: "Vehicle Manager | "+ req.session.user_role , bag: {setup: setup, e: process.error, session: req.session}} );
});

router.route("/home").get(function(req, res){
	check_login(res, req);
	res.render("vehicle", {title: "Vehicle Manager | "+ req.session.user_role , bag: {setup: setup, e: process.error, session: req.session}} );
});
router.route("/part").get(function(req, res){
	check_login(res, req);
	res.render("part2", {title: "Vehicle Manager | "+ req.session.user_role , bag: {setup: setup, e: process.error, session: req.session}} );
});
router.route("/updatePart").get(function(req, res){
	check_login(res, req);
	res.render("part2", {title: "Vehicle Manager | "+ req.session.user_role , bag: {setup: setup, e: process.error, session: req.session}} );
});
router.route("/dashboard").get(function(req, res){
	check_login(res, req);
	res.render("vehicle", {title: "Vehicle Manager | "+ req.session.user_role , bag: {setup: setup, e: process.error, session: req.session}} );
});
router.route("/vehicle").get(function(req, res){
	check_login(res, req);
	res.render("vehicle", {title: "Vehicle Manager | "+ req.session.user_role , bag: {setup: setup, e: process.error, session: req.session}} );
});
router.route("/customerVehicle").get(function(req, res){
	check_login(res, req);
	res.render("customerVehicle", {title: "Vehicle Manager | "+ req.session.user_role , bag: {setup: setup, e: process.error, session: req.session}} );
});
router.route("/validatePart").get(function(req, res){
	check_login(res, req);
	res.render("validatePart", {title: "Vehicle Manager | "+ req.session.user_role , bag: {setup: setup, e: process.error, session: req.session}} );
});


router.route("/getPart").post(function(req, res){

	chaincode.query.getPart([req.body.partId], function (e, part){
		if(e != null){
			console.log("Get Part error", e);
			res.send(e);
		}
		else{
			res.send(part);
		}
	})
});


router.route("/getAllParts").post(function(req, res){

	chaincode.query.getAllParts([req.body.user], function (e, resMsg){
		if(e != null){
			console.log("Get All Part error", e);
			res.send(e);
		}
		else{
			res.send(resMsg);
		}
	})
});

router.route("/login").get(function(req, res){
	res.render("login", {title: "Login", bag: {setup: setup, e: process.error, session: req.session}} );
});

router.route("/logout").get(function(req, res){
	req.session.destroy();
	res.redirect("/login");
});

router.route("/:page").post(function(req, res){
	req.session.error_msg = "Invalid username or password";
	var allUsers = [];
	for(var i in creds){		
		allUsers.push(JSON.parse(JSON.stringify(creds[i])));
		allUsers[i].password = "";
	}

	for(var i in creds){
		if(creds[i].username == req.body.username){
			if(creds[i].password == req.body.password){
				console.log("user has logged in", req.body.username);
				req.session.username = req.body.username;
				req.session.error_msg = null;
				req.session.allUsers = allUsers;
				// Roles are used to control access to various UI elements
				if(creds[i].role) {
					console.log("user has specific role:", creds[i].role);
					req.session.user_role = creds[i].role;
				} else {
					console.log("user role not specified, assuming:", "user");
					req.session.user_role = "user";
				}

				if(creds[i].displayname) {
					req.session.displayname = creds[i].displayname;
				} else {
					req.session.displayname = "user";
				}
				
				if(req.session.user_role == "CUSTOMER"){
					res.redirect("/customerVehicle");
				}
				else{
					res.redirect("/vehicle");
				}
				
				return;
			}
			break;
		}
	}
	res.redirect("/login");
});

module.exports = router;



function check_login(res, req){
	if(!req.session.username || req.session.username == ""){
		console.log("! not logged in, redirecting to login");
		res.redirect("/login");
	}
}


module.exports.setup = function(sdk, cc){
	ibc = sdk;
	chaincode = cc;
};

module.exports.setupParts = function(sdk, cc){
	ibc_parts = sdk;
	chaincode_parts = cc;
};

