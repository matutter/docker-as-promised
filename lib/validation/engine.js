module.exports.EngineValidator = EngineValidator

const inherits = require('./Validator.js').inherits
const validator = require('validator')

function EngineValidator() {
  EngineValidator.super_.call(this, {
    containers_list : {
      all : isTruthy,
      limit : isInteger,
      since: isDigest,
      before: isDigest,
      size: isTruthy,
      filters: isAny // this is frustrating, this SHOULD be information in the request BODY
    },
    create_container_name : {
      name: containerNameMatch
    },
    create_container_body : {
      Image: imageNameMatch
    },
    containers_inspect : {
      size: isTruthy
    }
  })
}
inherits(EngineValidator)

function match(regex) {
  return (val) => {
    const str = String(val)
    return str.match(regex)
  }
}

const containerNameMatch = match(/\/?[a-zA-Z0-9_-]+/)
const imageNameMatch = containerNameMatch

function isAny() {
  return true
}

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
