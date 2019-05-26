/**
 * Configuration.
 */

var clientModel = require('./mongo/model/client');
var userModel = require('./mongo/model/user');
var authTokenModel = require('./mongo/model/authToken');
var accessTokenModel = require('./mongo/model/accessToken');
var refreshTokenModel = require('./mongo/model/refreshToken');

/**
 * Add example client and user to the database (for debug).
 */

var loadExampleData = function() {
	var client1 = new clientModel({
		clientId: 'application',
		clientSecret: 'secret',
		grants: ['password'],
		redirectUris: []
	});

	var client2 = new clientModel({
		clientId: 'confidentialApplication',
		clientSecret: 'topSecret',
		grants: [
			'password',
			'client_credentials',
			'authorization_code',
			'refresh_token'
		],
		redirectUris: []
	});

	var user = new userModel({
		id: '123',
		username: 'pedroetb',
		password: 'password'
	});

	client1.save(function(err, client) {
		if (err) {
			return console.error(err);
		}
		console.log('Created client', client);
	});

	user.save(function(err, user) {
		if (err) {
			return console.error(err);
		}
		console.log('Created user', user);
	});

	client2.save(function(err, client) {
		if (err) {
			return console.error(err);
		}
		console.log('Created client', client);
	});
};

//loadExampleData(); // Execute this function for one time to seed your collections

/*
 * Methods used by all grant types.
 */

var getAccessToken = function(token) {
	return accessTokenModel.findOne({
		accessToken: token
	});
};

var getClient = function(clientId, clientSecret) {
	let params = { clientId: clientId };
	if (clientSecret) {
		params.clientSecret = clientSecret;
	}

	return clientModel.findOne(params);
};

var saveToken = function(token, client, user) {
	token.client = {
		id: client.id
	};

	token.user = {
		id: user.id
	};

	var accessTokenInstance = new accessTokenModel({
		accessToken: token.accessToken,
		accessTokenExpiresAt: token.accessTokenExpiresAt,
		scope: token.scope,
		client: token.client,
		user: token.user
	});

	if (token.refreshToken) {
		var refreshTokenInstance = new refreshTokenModel({
			refreshToken: token.refreshToken,
			refreshTokenExpiresAt: token.refreshTokenExpiresAt,
			scope: token.scope,
			client: token.client,
			user: token.user
		});

		return Promise.all([
			accessTokenInstance.save(),
			refreshTokenInstance.save()
		])
			.then(function() {
				return token;
			})
			.catch(function(err) {
				console.log('error occured in saveToken function', err);
			});
	} else {
		return accessTokenInstance.save();
	}
};

/*
 * Method used only by password grant type.
 */

var getUser = function(username, password) {
	return userModel.findOne({
		username: username,
		password: password
	});
};

/*
 * Method used only by client_credentials grant type.
 */

var getUserFromClient = function(client) {
	return clientModel.findOne({
		clientId: client.clientId,
		clientSecret: client.clientSecret,
		grants: 'client_credentials'
	});
};

/*
 * Method used only by authorization_code grant type.
 */

var saveAuthorizationCode = function(code, client, user) {
	code.client = {
		id: client.id
	};

	code.user = {
		id: user.id
	};

	var authTokenInstance = new authTokenModel(code);

	authTokenInstance.save();

	return code;
};

var getAuthorizationCode = function(authorizationCode) {
	return authTokenModel.findOne({
		authorizationCode: authorizationCode
	});
};

var revokeAuthorizationCode = function(code) {
	return authTokenModel.findOneAndRemove({
		authorizationCode: code.authorizationCode
	});
};

/*
 * Method used only by refresh_token grant type.
 */

var getRefreshToken = function(refreshToken) {
	return refreshTokenModel.findOne({
		refreshToken: refreshToken
	});
};

var revokeToken = function(token) {
	return refreshTokenModel.findOneAndRemove({
		refreshToken: token.refreshToken
	});
};

/**
 * Export model definition object.
 */

module.exports = {
	getAccessToken: getAccessToken,
	getClient: getClient,
	saveToken: saveToken,
	getUser: getUser,
	getUserFromClient: getUserFromClient,
	saveAuthorizationCode: saveAuthorizationCode,
	getAuthorizationCode: getAuthorizationCode,
	revokeAuthorizationCode: revokeAuthorizationCode,
	getRefreshToken: getRefreshToken,
	revokeToken: revokeToken
};
