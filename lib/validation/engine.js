module.exports.EngineValidator = EngineValidator

const inherits = require('./Validator.js').inherits
const validator = require('validator')

function EngineValidator() {
  EngineValidator.super_.call(this, {
    '/containers/json' : ContainerParams
  })
}
inherits(EngineValidator)

function isInteger(val) {
  return validator.isInt(String(val))
}

function isTruthy(val) {
  return validator.isBoolean(String(val).toLowerCase())
}

function isDigest(val) {
  var str = String(val)
  return str.substr(0, 7) === 'sha256:' && validator.isBase64(str.substr(7))
}

function EmptyParams(qs) {
  if(qs) throw new Error('Endpoint does not support querystring')
  return false
}


function ContainerParams(qs) {
  return {
    limit : isInteger,
    all : isTruthy,
    size: isTruthy,
    since: isDigest
  }
}


