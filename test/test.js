/* eslint-env mocha */

var requestId = require('../requestId.js')
var request = require('supertest')
var express = require('express')
var assert = require('assert')
var uuid = require('uuid-1345')

describe('Checking requestId', function () {
  var app = express()

  app.use(requestId())
  app.get('/', function (req, res, next) {
    return res.sendStatus(200)
  })

  it('should return 200 with a request ID', function (done) {
    request(app)
    .get('/')
    .expect(function (res) {
      assert.ok(uuid.check(res.get('X-Request-Id')))
    })
    .expect(200, done)
  })
})
