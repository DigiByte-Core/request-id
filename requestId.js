'use strict'

var requestId = require('request-id/express')
var uuid = require('uuid-1345')

module.exports = function (options) {
  options = options || {}
  options.generator = uuid.v4fast
  return requestId(options)
}
