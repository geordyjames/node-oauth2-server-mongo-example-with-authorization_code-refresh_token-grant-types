# node-oauth2-server with MongoDB example with authorization_code & refresh_token grant types

This is a basic example of a OAuth2 server, using [node-oauth2-server](https://github.com/oauthjs/node-oauth2-server) (version 3.0.1) with MongoDB storage and the minimum (only the required to work) model configuration that includes both authorization_code & refresh_token grant types.

This example is created by extending [node-oauth2-server with MongoDB example
](https://github.com/pedroetb/node-oauth2-server-mongo-example) by [Pedro Trujillo](https://github.com/pedroetb). I modifed the code to add [authorization_code](https://tools.ietf.org/html/rfc6749.html#section-4) & [refresh_token](https://tools.ietf.org/html/rfc6749.html#section-6) grant types to it.

## Setup

First, you should have [MongoDB](https://www.mongodb.com/) installed and running on your machine.

You also need to install **nodejs** and **npm** and then, simply run `npm install` and `npm start`. The server should now be running at `http://localhost:3000`.

## Usage

You can use different grant types to get an access token. By now, `password`, `client_credentials`, `authorization_code` and `refresh_token` are available.

### Checking example data

Firstly, you should create some entries in your **MongoDB** database.

> You can call the `loadExampleData` function at `model.js` in order to create these entries automatically.

#### With *password* grant

You need to add a client. For example:

* **clientId**: `application`
* **secret**: `secret`

And you have to add a user too. For example:

* **username**: `pedroetb`
* **password**: `password`

#### With *client_credentials*, *authorization_code*, *refresh_token* grant

You need to add a confidential client. For example:

* **clientId**: `confidentialApplication`
* **secret**: `topSecret`

You don't need any user to use with client_credentials grant type, but for security is only available to confidential clients.

### Generate Authorization Code

If you are going to use authorization_code grant then you need to get a `Authorization Code` from Authorization Server. After you get Authorization Code you can use this code to request access token from Authorization Server. 

> You can call `http://localhost:3000/oauth/authorize?response_type=code&client_id=confidentialApplication` from your browser to quickly generate both authorization Code and its associated access token.

You need to include the response_type and client id in the url parameter of the request. You can see the specification [here](https://tools.ietf.org/html/rfc6749.html#section-4.1.1).

For example, using `curl`:

```
curl http://localhost:3000/oauth/authorize?response_type=code&client_id=confidentialApplication
```

### Obtaining a access token

To obtain a token you should POST to `http://localhost:3000/oauth/token`.

#### With *authorization_code* grant

You need to include the client credentials in request headers and the grant type in request body:

* **Headers**
	* **Authorization**: `"Basic " + clientId:secret base64'd`
		* (for example, to use `confidentialApplication:topSecret`, you should send `Basic Y29uZmlkZW50aWFsQXBwbGljYXRpb246dG9wU2VjcmV0`)

	* **Content-Type**: `application/x-www-form-urlencoded`
* **Body**
	* `grant_type=authorization_code&code=YOUR_AUTH_TOKEN&redirect_uri=http://localhost:3000/callback`

For example, using `curl`:
```
curl http://localhost:3000/oauth/token \
	-d "grant_type=client_credentials" \
	-d "code=YOUR_REFRESH_TOKEN" \
	-d "redirect_uri=http://localhost:3000/callback" \
	-H "Authorization: Basic Y29uZmlkZW50aWFsQXBwbGljYXRpb246dG9wU2VjcmV0" \
	-H "Content-Type: application/x-www-form-urlencoded"
```

If all goes as planned, you should receive a response like this:

```
{
	"accessToken": "e43090954b88e498e245627aec332ed9050a6d4f",
	"authorizationCode": "ecc02871f9a3a1d8adc5ce01deb4bb39ab2272e3",
	"accessTokenExpiresAt": "2019-05-26T13:11:41.962Z",
	"refreshToken": "de4b2959bb473118b80ff638812ee052bbd2aad2",
	"refreshTokenExpiresAt": "2019-06-09T12:11:41.962Z",
	"client": {
		"id": "5cea11f55d51230f91e9469f"
	},
	"user": {
		"id": "5cea11f55d51230f91e946a0"
	}
}
```

#### With *password* grant

You need to include the client credentials in request headers and the user credentials and grant type in request body:

* **Headers**
	* **Authorization**: `"Basic " + clientId:secret base64'd`
		* (for example, to use `application:secret`, you should send `Basic YXBwbGljYXRpb246c2VjcmV0`)

	* **Content-Type**: `application/x-www-form-urlencoded`
* **Body**
	* `grant_type=password&username=pedroetb&password=password`
		* (contains 3 parameters: `grant_type`, `username` and `password`)

For example, using `curl`:
```
curl http://localhost:3000/oauth/token \
	-d "grant_type=password" \
	-d "username=pedroetb" \
	-d "password=password" \
	-H "Authorization: Basic YXBwbGljYXRpb246c2VjcmV0" \
	-H "Content-Type: application/x-www-form-urlencoded"
```

If all goes as planned, you should receive a response like this:

```
{
	"accessToken": "951d6f603c2ce322c5def00ce58952ed2d096a72",
	"accessTokenExpiresAt": "2018-11-18T16:18:25.852Z",
	"refreshToken": "67c8300ad53efa493c2278acf12d92bdb71832f9",
	"refreshTokenExpiresAt": "2018-12-02T15:18:25.852Z",
	"client": {
		"id": "5cea11f55d51230f91e9469e"
	},
	"user": {
		"id": "5cea11f55d51230f91e946a0"
	}
}
```

#### With *client_credentials* grant

You need to include the client credentials in request headers and the grant type in request body:

* **Headers**
	* **Authorization**: `"Basic " + clientId:secret base64'd`
		* (for example, to use `confidentialApplication:topSecret`, you should send `Basic Y29uZmlkZW50aWFsQXBwbGljYXRpb246dG9wU2VjcmV0`)

	* **Content-Type**: `application/x-www-form-urlencoded`
* **Body**
	* `grant_type=client_credentials`

For example, using `curl`:
```
curl http://localhost:3000/oauth/token \
	-d "grant_type=client_credentials" \
	-H "Authorization: Basic Y29uZmlkZW50aWFsQXBwbGljYXRpb246dG9wU2VjcmV0" \
	-H "Content-Type: application/x-www-form-urlencoded"
```

If all goes as planned, you should receive a response like this:

```
{
	"accessToken": "951d6f603c2ce322c5def00ce58952ed2d096a72",
	"accessTokenExpiresAt": "2018-11-18T16:18:25.852Z",
	"client": {
		"id": "5cea11f55d51230f91e9469f"
	},
	"user": {
		"id": "5cea11f55d51230f91e9469f"
	}
}
```

#### With *refresh_token* grant

You need to include the client credentials in request headers and the grant type in request body:

* **Headers**
	* **Authorization**: `"Basic " + clientId:secret base64'd`
		* (for example, to use `confidentialApplication:topSecret`, you should send `Basic Y29uZmlkZW50aWFsQXBwbGljYXRpb246dG9wU2VjcmV0`)

	* **Content-Type**: `application/x-www-form-urlencoded`
* **Body**
	* `grant_type=refresh_token&refresh_token=YOUR_REFRESH_TOKEN`

For example, using `curl`:
```
curl http://localhost:3000/oauth/token \
	-d "grant_type=client_credentials" \
	-d "refresh_token=YOUR_REFRESH_TOKEN" \
	-H "Authorization: Basic Y29uZmlkZW50aWFsQXBwbGljYXRpb246dG9wU2VjcmV0" \
	-H "Content-Type: application/x-www-form-urlencoded"
```

If all goes as planned, you should receive a response like this:

```
{
    "accessToken": "c00ee073b05887291d53b00761e72f1267c300f1",
    "accessTokenExpiresAt": "2019-05-26T12:39:36.693Z",
    "refreshToken": "d7d1141fa4b9e56313f58fd06eb0d45a4850efa9",
    "refreshTokenExpiresAt": "2019-06-09T11:39:36.693Z",
    "client": {
        "id": "5cea11f55d51230f91e9469f"
    },
    "user": {
        "id": "5cea11f55d51230f91e946a0"
    }
}
```

You can also use the example route I created to get new accesss token via refresh token - `http://localhost:3000/refresh?refresh_token=YOUR_REFRESH_TOKEN`

### Using the access token

Now, you can use your brand-new token to access restricted areas. For example, you can GET to `http://localhost:3000/` including your token at headers:

* **Headers**
	* **Authorization**: `"Bearer " + access_token`
		* (for example, `Bearer 951d6f603c2ce322c5def00ce58952ed2d096a72`)

For example, using `curl`:
```
curl http://localhost:3000 \
	-H "Authorization: Bearer 951d6f603c2ce322c5def00ce58952ed2d096a72"
```