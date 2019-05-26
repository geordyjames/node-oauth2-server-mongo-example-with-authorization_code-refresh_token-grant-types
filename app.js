var express = require('express');
var	bodyParser = require('body-parser');
var	mongoose = require('mongoose');
var	OAuth2Server = require('oauth2-server');
var	fetch = require('node-fetch');
var	Request = OAuth2Server.Request;
var	Response = OAuth2Server.Response;

var app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

var mongoUri = 'mongodb://localhost/oauth';

mongoose.connect(
	mongoUri,
	{
		useCreateIndex: true,
		useNewUrlParser: true
	},
	function(err, res) {
		if (err) {
			return console.error('Error connecting to "%s":', mongoUri, err);
		}
		console.log('Connected successfully to "%s"', mongoUri);
	}
);

var getUser = require('./model.js').getUser;

var authenticateHandler = {
	handle: function(request, response) {
		/* 
		* Get authenticated user
		* For simplicity I am implicitly signing in a user.
		* I real world application you need to sign in user and show autherization permission popup.
		*/
		return getUser('pedroetb', 'password');
	}
};

app.oauth = new OAuth2Server({
	model: require('./model.js'),
	accessTokenLifetime: 60 * 60,
	allowBearerTokensInQueryString: true,
	allowEmptyState: true,
	authenticateHandler: authenticateHandler
});

/**
 * This route is used to get Autherization code in case of authorization_code grant type
 * Eg http://localhost:3000/oauth/authorize?response_type=code&client_id=confidentialApplication
 */
app.get('/oauth/authorize', authorizeHandler);

app.all('/oauth/token', obtainToken);

app.get('/', authenticateRequest, function(req, res) {
	res.send('Congratulations, you are in a secret area!');
});

/**
 * This route is a example route to handle callback from authorizeHandler
 * It will then use Autherization token to request a new acess token
 */
app.get('/callback', function(req, res) {
	fetch('http://localhost:3000/oauth/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
			Authorization: 'Basic Y29uZmlkZW50aWFsQXBwbGljYXRpb246dG9wU2VjcmV0' // base64 encodes confidentialApplication:topSecret
		},
		body:
			'grant_type=authorization_code&code=' +
			req.query.code +
			'&redirect_uri=http://localhost:3000/callback'
	})
		.then(response => response.json())
		.then(data => res.json(data))
		.catch(function(err) {
			res.status(err.code || 500).json(err);
		});
});

/**
 * This route is a example route to request new access token
 * Eg: http://localhost:3000/refresh?refresh_token=YOUR_REFRESH_TOKEN
 */
app.get('/refresh', function(req, res) {
	fetch('http://localhost:3000/oauth/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
			Authorization: 'Basic Y29uZmlkZW50aWFsQXBwbGljYXRpb246dG9wU2VjcmV0' // base64 encodes confidentialApplication:topSecret
		},
		body: 'grant_type=refresh_token&refresh_token=' + req.query.refresh_token
	})
		.then(response => response.json())
		.then(data => res.json(data))
		.catch(function(err) {
			res.status(err.code || 500).json(err);
		});
});

app.listen(3000);

function authorizeHandler(req, res) {
	var request = new Request(req);
	var response = new Response(res);
	return app.oauth
		.authorize(request, response)
		.then(function(code) {
			res.redirect(code.redirectUri + '?code=' + code.authorizationCode);
		})
		.catch(function(err) {
			res.status(err.code || 500).json(err);
		});
}

function obtainToken(req, res) {
	var request = new Request(req);
	var response = new Response(res);

	return app.oauth
		.token(request, response)
		.then(function(token) {
			res.json(token);
		})
		.catch(function(err) {
			res.status(err.code || 500).json(err);
		});
}

function authenticateRequest(req, res, next) {
	var request = new Request(req);
	var response = new Response(res);

	return app.oauth
		.authenticate(request, response)
		.then(function(token) {
			next();
		})
		.catch(function(err) {
			res.status(err.code || 500).json(err);
		});
}

