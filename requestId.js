'use strict'

var uuid = require('uuid')
var request = require('request')
var crypto = require('crypto')
var url = require('url')

module.exports = function (settings) {
  settings = settings || {}
  if (!settings.secret) throw new Error('Must provide secret')
  var secret = settings.secret
  var serviceSecret = settings.serviceSecret || 'service-secret'
  var correlationId = settings.correlationId || 'correlation-id'
  var requestId = settings.requestId || 'request-id'
  var namespace = (settings.namespace && (settings.namespace + '-')) || 'namespace-'

  return function (req, res, next) {
    var sid = req.headers && req.headers[serviceSecret]
    var cid = req.headers && req.headers[correlationId]
    var rid = namespace + uuid.v4()
    req.headers[requestId] = rid
    try {
      if (!sid) {
        cid = url.parse(req.originalUrl).pathname + '-' + rid
        req.headers[correlationId] = cid
        sid = crypto.createHmac('md5', secret).update(cid).digest('hex')
      } else {
        if (!cid) return next(['Received service-secret in request headers but not correlation-id', 401])
        var sidTmp = crypto.createHmac('md5', secret).update(cid).digest('hex')
        if (sid !== sidTmp) return next(['Received correlation-id not authenticated', 401])
      }
    } catch (e) {
      return next(e)
    }

    var headers = {}
    headers[correlationId] = cid
    headers[serviceSecret] = sid
    req.service = {
      request: request.defaults({headers: headers})
    }
    res.setHeader(requestId, rid)
    res.setHeader(correlationId, cid)
    return next()
  }
}
