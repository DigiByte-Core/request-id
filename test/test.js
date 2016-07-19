/* eslint-env mocha */

var requestId = require('../requestId.js')
var request = require('supertest')
var httpMocks = require('node-mocks-http')
var portfinder = require('portfinder')
var express = require('express')
var assert = require('assert')
var errorHandler = require('cc-error-handler')

var cid = '/-server1-7d3f17a1-f94c-46b0-a69f-b54a71f8415d'
var fakeCid = '123'
var sid = '88e7709bb032765f56aa49c1ba6fac1a'
var wrongSid = '88e7709bb032765f56aa49c1ba6fac1b'

describe('Checking requestId', function () {
  var app = express()

  app.use(requestId({secret: '1234', namespace: 'server1'}))
  app.get('/', function (req, res, next) {
    return res.sendStatus(200)
  })
  app.use(errorHandler())

  it('should throw error since secret is mandatory', function (done) {
    assert.throws(function () { requestId({ namespace: 'server1' }) }, 'Must provide secret')
    done()
  })

  it('should return 200 with a request ID, correlation ID in the response header', function (done) {
    request(app)
    .get('/')
    .expect(function (res) {
      assert.equal(res.headers['request-id'].split('-')[0], 'server1', 'Namespace should be server1')
      assert.equal(res.headers['correlation-id'].split('-')[0], '/')
      assert.equal(res.headers['correlation-id'].split('-')[1], 'server1')
    })
    .expect(200, done)
  })

  it('should return 200 and ignore our correlation-id with no service-secret', function (done) {
    request(app)
    .get('/')
    .set('correalation-id', fakeCid)
    .expect(function (res) {
      var resCid = res.headers['correlation-id']
      assert.notEqual(resCid, fakeCid, 'Should have ignored the fakeCid')
      assert.equal(resCid.split('-')[0], '/', 'endpoint should be /')
      assert.equal(resCid.split('-')[1], 'server1', 'Namespace should be server1')
    })
    .expect(200, done)
  })

  it('should return 200 and same cid since cid and sid are correct', function (done) {
    request(app)
    .get('/')
    .set('correlation-id', cid)
    .set('service-secret', sid)
    .expect('correlation-id', cid)
    .expect(function (res) {
      assert.equal(res.headers['correlation-id'], cid)
    })
    .expect(200, done)
  })

  it('should return 401 since sid exist without cid', function (done) {
    request(app)
    .get('/')
    .set('service-secret', sid)
    .expect(401, done)
  })

  it('should return 401 since sid is wrong', function (done) {
    request(app)
    .get('/')
    .set('correalation-id', cid)
    .set('service-secret', wrongSid)
    .expect(401, done)
  })
})

describe('Checking requestid with default name', function () {
  var app = express()
  app.use(requestId({secret: '1234'}))
  app.get('/', function (req, res, next) {
    return res.sendStatus(200)
  })

  it('should return 200 with default namespace', function (done) {
    request(app)
    .get('/')
    .expect(function (res) {
      assert.equal(res.headers['request-id'].split('-')[0], 'namespace', 'Namespace should be namespace')
    })
    .expect(200, done)
  })
})

describe('Checking requestId request', function () {
  var request, response

  beforeEach(function (done) {
    request = httpMocks.createRequest({
      method: 'GET',
      url: '/'
    })
    response = httpMocks.createResponse()
    done()
  })

  it('should have headers with correalation-id and request-id, no service-secret', function (done) {
    requestId({secret: '123', namespace: 'server1'})(request, response, function next (err) {
      assert.equal(err, undefined)
      assert.equal(request.headers['request-id'].split('-')[0], 'server1')
      assert.equal(request.headers['correlation-id'].split('-')[0], '/')
      assert.equal(request.headers['correlation-id'].split('-')[1], 'server1')
      assert.equal(request.headers['service-secret'], undefined)
      done()
    })
  })

  it('.service.request headers should have correalation-id and service-secret, no request-id', function (done) {
    requestId({secret: '123', namespace: 'server1'})(request, response, function next (err) {
      assert.equal(err, undefined)
      assert.ok(request.service)
      assert.ok(request.service.request)
      var app = express()
      app.get('/', function (req, res, next) {
        res.status(200).send(req.headers)
      })
      portfinder.getPort(function (err, port) {
        if (err) throw new Error('Unable to find free port for test server')
        app.listen(port, function (err) {
          if (err) throw new Error('Unable to start test server')
          request.service.request('http://localhost:' + port + '/', function (err, reponse, body) {
            assert.equal(err, undefined)
            body = JSON.parse(body)
            assert.ok(body['service-secret'])
            assert.equal(body['request-id'], undefined)
            assert.equal(body['correlation-id'].split('-')[0], '/')
            assert.equal(body['correlation-id'].split('-')[1], 'server1')
            done()
          })
        })
      })
    })
  })
})

describe('Checking requestId throws', function () {
  var app = express()
  app.use(requestId({secret: 123}))
  app.get('/', function (req, res, next) {
    return res.sendStatus(200)
  })

  it('should return 500 since secret is not a buffer or string', function (done) {
    request(app)
    .get('/')
    .expect(500, done)
  })
})
