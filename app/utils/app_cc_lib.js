//-------------------------------------------------------------------
// Chaincode Library
//-------------------------------------------------------------------

module.exports = function (enrollObj, g_options, fcw, logger) {
	var app_chainCode = {};

	// Chaincode -------------------------------------------------------------------------------

	//check if chaincode exists
	app_chainCode.check_if_already_instantiated = function (options, cb) {
		console.log('');
		logger.info('Checking for chaincode...');

		var opts = {
			peer_urls: g_options.peer_urls,
			peer_tls_opts: g_options.peer_tls_opts,
			channel_id: g_options.channel_id,
			chaincode_id: g_options.chaincode_id,
			chaincode_version: g_options.chaincode_version,
			cc_function: 'read',
			cc_args: ['selftest']
		};
		fcw.query_chaincode(enrollObj, opts, function (err, resp) {
			if (err != null) {
				if (cb) return cb(err, resp);
			}
			else {
				if (resp.parsed == null || isNaN(resp.parsed)) {	 //if nothing is here, no chaincode
					if (cb) return cb({ error: 'chaincode not found' }, resp);
				}
				else {
					if (cb) return cb(null, resp);
				}
			}
		});
	};

	//check chaincode version
	app_chainCode.check_version = function (options, cb) {
		console.log('');
		logger.info('Checking chaincode and ui compatibility...');

		var opts = {
			peer_urls: g_options.peer_urls,
			peer_tls_opts: g_options.peer_tls_opts,
			channel_id: g_options.channel_id,
			chaincode_id: g_options.chaincode_id,
			chaincode_version: g_options.chaincode_version,
			cc_function: 'read',
			cc_args: ['']
		};
		fcw.query_chaincode(enrollObj, opts, function (err, resp) {
			if (err != null) {
				if (cb) return cb(err, resp);
			}
			else {
				if (resp.parsed == null) {							//if nothing is here, no chaincode
					if (cb) return cb({ error: 'chaincode not found' }, resp);
				}
				else {
					if (cb) return cb(null, resp);
				}
			}
		});
	};

	//create part
	app_chainCode.createPart = function (options, cb) {
		console.log('');
		logger.info('Creating Vehicle...');

		var opts = {
			peer_urls: g_options.peer_urls,
			peer_tls_opts: g_options.peer_tls_opts,
			channel_id: g_options.channel_id,
			chaincode_id: g_options.chaincode_id,
			chaincode_version: g_options.chaincode_version,
			event_url: g_options.event_url,
			endorsed_hook: options.endorsed_hook,
			ordered_hook: options.ordered_hook,
			cc_function: 'createPart',
			cc_args: [
				options.args.partId,
				options.args.productCode,
				options.args.dateOfManufacture,
				options.args.user
			],
		};
		fcw.invoke_chaincode(enrollObj, opts, cb);
	};

	//update part
	app_chainCode.updatePart = function (options, cb) {
		console.log('');
		logger.info('Creating Vehicle...');

		var opts = {
			peer_urls: g_options.peer_urls,
			peer_tls_opts: g_options.peer_tls_opts,
			channel_id: g_options.channel_id,
			chaincode_id: g_options.chaincode_id,
			chaincode_version: g_options.chaincode_version,
			event_url: g_options.event_url,
			endorsed_hook: options.endorsed_hook,
			ordered_hook: options.ordered_hook,
			cc_function: 'updatePart',
			cc_args: [
				options.args.partId,
				options.args.vehicleId,
				options.args.dateOfDelivery,
				options.args.dateOfInstallation,
				options.args.user,
				options.args.warrantyStartDate,
				options.args.warrantyEndDate,
				options.args.ttype
			],
		};
		fcw.invoke_chaincode(enrollObj, opts, cb);
	};

	//create vehicle
	app_chainCode.createVehicle = function (options, cb) {
		console.log('');
		logger.info('Creating Vehicle...');

		var opts = {
			peer_urls: g_options.peer_urls,
			peer_tls_opts: g_options.peer_tls_opts,
			channel_id: g_options.channel_id,
			chaincode_id: g_options.chaincode_id,
			chaincode_version: g_options.chaincode_version,
			event_url: g_options.event_url,
			endorsed_hook: options.endorsed_hook,
			ordered_hook: options.ordered_hook,
			cc_function: 'createVehicle',
			cc_args: [
				options.args.make,
				options.args.chassisNumber,
				options.args.vin,
				options.args.owner,
				options.args.variant,
				options.args.engine,
				options.args.gearBox,
				options.args.color,
				options.args.image
			],
		};
		fcw.invoke_chaincode(enrollObj, opts, cb);
	};

	//create vehicle
	app_chainCode.updateVehicle = function (options, cb) {
		console.log('');
		logger.info('Updating Vehicle...');

		var opts = {
			peer_urls: g_options.peer_urls,
			peer_tls_opts: g_options.peer_tls_opts,
			channel_id: g_options.channel_id,
			chaincode_id: g_options.chaincode_id,
			chaincode_version: g_options.chaincode_version,
			event_url: g_options.event_url,
			endorsed_hook: options.endorsed_hook,
			ordered_hook: options.ordered_hook,
			cc_function: 'updateVehicle',
			cc_args: [
				options.args.vehicleId, 
				options.args.ttype, 
				options.args.vehicleOwner.name, options.args.vehicleOwner.phoneNumber, options.args.vehicleOwner.email, 
				options.args.dealer.name, options.args.dealer.phoneNumber, options.args.dealer.email, 
				options.args.licensePlateNumber, 
				options.args.dateofDelivery, 
				options.args.warrantyStartDate, 
				options.args.warrantyEndDate, 
				options.args.owner, 
				options.args.parts,
				options.args.serviceDone,
				options.args.serviceDescription
			],
		};
		fcw.invoke_chaincode(enrollObj, opts, cb);
	};


	//get vehicle
	app_chainCode.getAllVehicles = function (options, cb) {
		logger.info('fetching all vehicles');

		var opts = {
			peer_urls: g_options.peer_urls,
			peer_tls_opts: g_options.peer_tls_opts,
			channel_id: g_options.channel_id,
			chaincode_version: g_options.chaincode_version,
			chaincode_id: g_options.chaincode_id,
			cc_function: 'getAllVehicles',
			cc_args: [options.args.owner]
		};
		fcw.query_chaincode(enrollObj, opts, cb);
	};

	//get vehicle
	app_chainCode.getVehicle = function (options, cb) {
		logger.info('fetching vehicle');

		var opts = {
			peer_urls: g_options.peer_urls,
			peer_tls_opts: g_options.peer_tls_opts,
			channel_id: g_options.channel_id,
			chaincode_version: g_options.chaincode_version,
			chaincode_id: g_options.chaincode_id,
			cc_function: 'getVehicle',
			cc_args: [options.args.vehicleId]
		};
		fcw.query_chaincode(enrollObj, opts, cb);
	};

	//get vehicle by vin
	app_chainCode.getVehicleByVIN = function (options, cb) {
		logger.info('fetching vehicle');

		var opts = {
			peer_urls: g_options.peer_urls,
			peer_tls_opts: g_options.peer_tls_opts,
			channel_id: g_options.channel_id,
			chaincode_version: g_options.chaincode_version,
			chaincode_id: g_options.chaincode_id,
			cc_function: 'getVehicleByVIN',
			cc_args: [options.args.vin]
		};
		fcw.query_chaincode(enrollObj, opts, cb);
	};

	//get vehicle by chassis number
	app_chainCode.getVehicleByChassisNumber = function (options, cb) {
		logger.info('fetching vehicle');

		var opts = {
			peer_urls: g_options.peer_urls,
			peer_tls_opts: g_options.peer_tls_opts,
			channel_id: g_options.channel_id,
			chaincode_version: g_options.chaincode_version,
			chaincode_id: g_options.chaincode_id,
			cc_function: 'getVehicleByChassisNumber',
			cc_args: [options.args.chassisNumber]
		};
		fcw.query_chaincode(enrollObj, opts, cb);
	};

	//get part
	app_chainCode.getPart = function (options, cb) {
		logger.info('fetching part');

		var opts = {
			peer_urls: g_options.peer_urls,
			peer_tls_opts: g_options.peer_tls_opts,
			channel_id: g_options.channel_id,
			chaincode_version: g_options.chaincode_version,
			chaincode_id: g_options.chaincode_id,
			cc_function: 'getPart',
			cc_args: [options.args.partId]
		};
		fcw.query_chaincode(enrollObj, opts, cb);
	};

	//get all parts
	app_chainCode.getAllParts = function (options, cb) {
		logger.info('fetching all parts');

		var opts = {
			peer_urls: g_options.peer_urls,
			peer_tls_opts: g_options.peer_tls_opts,
			channel_id: g_options.channel_id,
			chaincode_version: g_options.chaincode_version,
			chaincode_id: g_options.chaincode_id,
			cc_function: 'getAllParts',
			cc_args: [""]
		};
		fcw.query_chaincode(enrollObj, opts, cb);
	};

	//build full name
	app_chainCode.build_owner_name = function (username, company) {
		return build_owner_name(username, company);
	};

	// get block height of the channel
	app_chainCode.channel_stats = function (options, cb) {
		var opts = {
			peer_urls: g_options.peer_urls,
			peer_tls_opts: g_options.peer_tls_opts
		};
		fcw.query_channel(enrollObj, opts, cb);
	};

	app_chainCode.query_block = function (blockNumber, options, cb) {
		var opts = {
			peer_urls: g_options.peer_urls,
			peer_tls_opts: g_options.peer_tls_opts,
			block_id: blockNumber
		};
		fcw.query_block(enrollObj, opts, cb);
	};


	// Other -------------------------------------------------------------------------------

	// Format Owner's Actual Key Name
	function build_owner_name(username, company) {
		return username.toLowerCase() + '.' + company;
	}

	// random string of x length
	function randStr(length) {
		var text = '';
		var possible = 'abcdefghijkmnpqrstuvwxyz0123456789ABCDEFGHJKMNPQRSTUVWXYZ';
		for (var i = 0; i < length; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
		return text;
	}

	// left pad string with "0"s
	function leftPad(str, length) {
		for (var i = str.length; i < length; i++) str = '0' + String(str);
		return str;
	}

	return app_chainCode;
};

