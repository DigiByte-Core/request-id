'use strict'

var uuid = require('uuid')
var request = require('request')
var crypto = require('crypto')
var url = require('url')

module.exports = function (settings) {
  settings = settings || {}
  if (!settings.secret) throw new Error('Must provide secret')
  var secret = settings.secret
  var serviceSecretKey = settings.serviceSecretKey || 'service-secret'
  var correlationIdKey = settings.correlationIdKey || 'correlation-id'
  var requestIdKey = settings.requestIdKey || 'request-id'
  var remoteIdKey = settings.remoteIdKey || 'remote-id'
  var namespace = (settings.namespace && (settings.namespace + '-')) || 'namespace-'

  return function (req, res, next) {
    var sid = req.headers && req.headers[serviceSecretKey]
    var cid = req.headers && req.headers[correlationIdKey]
    var remoteId = req.headers && req.headers[remoteIdKey]
    var rid = namespace + uuid.v4()
    req.headers[requestIdKey] = rid
    try {
      if (!sid) {
        cid = url.parse(req.originalUrl).pathname + '-' + rid
        req.headers[correlationIdKey] = cid
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
    headers[correlationIdKey] = cid
    headers[serviceSecretKey] = sid
    if (remoteId) headers[remoteIdKey] = remoteId
    req.service = {
      headersToForward: headers,
      request: request.defaults({headers: headers})
    }
    res.setHeader(requestIdKey, rid)
    res.setHeader(correlationIdKey, cid)
    if (remoteId) res.setHeader(remoteIdKey, remoteId)
    return next()
  }
}
