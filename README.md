[![Build Status](https://travis-ci.org/Colored-Coins/cc-request-id.svg?branch=master)](https://travis-ci.org/Colored-Coins/cc-request-id)
[![Coverage Status](https://coveralls.io/repos/github/Colored-Coins/cc-request-id/badge.svg?branch=master)](https://coveralls.io/github/Colored-Coins/cc-request-id?branch=master)
[![npm version](https://badge.fury.io/js/cc-request-id.svg)](https://badge.fury.io/js/cc-request-id)
# request-id
Express.js request-id middleware.
Generates and sets a new request UUID in each request header (by default in `request-id` header), generates and sets a correlation UUID if not already exists (by default in `correlation-id` header).
## Installation
```sh
$ npm install cc-request-id
```
## Running the tests
```
$ npm install
$ mocha
```
## API
```javascript
var requestId = require('cc-request-id')
```
### requestId(options)
Create new request-id middleware.
#### options
##### secret
Secret string for authenticating an incoming request correlation ID was generated from a trusted server holding the same secret.
##### namespace (optional)
String to be used as prefix for every generated request-id (and conatenated right after the request URL path name in correlation ID, if generated)
##### serviceSecret (optional)
Key of the request header to be set for authenticating an incoming request correlation ID was generated from a trusted server holding the same secret.
##### requestId (optional)
Key of the request header to be set for the request ID.
##### correlationId (optional)
Key of the request header to be set for the correlation ID.

## Example
```javascript
var express = require('express')
var app = express()
var requestId = require('cc-request-id')
var bodyParser = require('body-parser')

app.use(requestId({secret: '1234', namespace: 'myServer'}))
app.use(bodyParser())
app.get('/test', function (req, res, next) {
	res.status(200).send({
		requsetId: req.headers['request-id'],
		corellationId: req.headers['correlation-id']
	})
})
app.listen(8080)
```
test it:
```
curl http://localhost:8080/test
```
outputs:
```
requestId: myServer-32fd0631-5a10-4564-b8c7-f704be22f13a
corellationId: /test-myServer-32fd0631-5a10-4564-b8c7-f704be22f13a
```
