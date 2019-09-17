[![Build Status](https://travis-ci.org/Colored-Coins/request-id.svg?branch=master)](https://travis-ci.org/Colored-Coins/request-id)
[![Coverage Status](https://coveralls.io/repos/github/Colored-Coins/request-id/badge.svg?branch=master)](https://coveralls.io/github/Colored-Coins/request-id?branch=master)
[![npm version](https://badge.fury.io/js/cc-request-id.svg)](https://badge.fury.io/js/cc-request-id)
# request-id
Express.js request-id middleware.<br>
Allows you to identify client requests within non-sequential logs by adding a response header of `X-Request-Id`.
Allows setting value via query parameter or request header.

## Installation
```sh
$ npm install digiasset-request-id
```
## Running the tests
```
$ npm install
$ mocha
```
## API
```javascript
var requestId = require('digiasset-request-id')
```
### requestId(options)
Create new request-id middleware.
#### options
See [request-id options](https://github.com/wilmoore/request-id.js#options).
Exception:
Default value generator function: [uuid-1345.v4fast]

## Example
```javascript
var express = require('express')
var app = express()
var requestId = require('digiasset-request-id')
var bodyParser = require('body-parser')

app.use(requestId())
app.use(bodyParser())
app.get('/test', function (req, res, next) {
  res.send('OK')
})
app.listen(8080)
```
test it:
```
curl http://localhost:8080/test -I | grep X-Request-Id
```
outputs:
```
X-Request-Id: 98401c07-e91a-40ca-813e-5407970de407
```

## License

[MIT](license)

[uuid-1345.v4fast]:   https://github.com/scravy/uuid-1345#uuidv4fast
