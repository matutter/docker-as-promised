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
    inspect_container : {
      size: isTruthy
    },
    remove_container : {
      v: isTruthy,
      force: isTruthy
    },
    top_container : {
      ps_args: matchAll(/[-]*[a-zA-Z]+\s?[+-a-zA-Z0-9]*/g)
    },
    start_container : {
      detachKeys: matchAll(/(^ctrl-[a-z@^[,_])|[a-zA-Z]/)
    },
    stop_container : {
      t: isInteger
    },
    create_image : { // TODO, validation needs to also be on the existence of properties
      fromImage: isString,
      tag: isAny,
      repo: isAny,
      fromSrc: isAny
    }
  })
}
inherits(EngineValidator)

function matchAll(regex) {
  return (val) => {
    const str = String(val)
    var matched = str.match(regex)
    if(matched.length > 0) {
      var match = matched[0]
      return str == match
    }
    return false
  }
}

const containerNameMatch = matchAll(/\/?[a-zA-Z0-9_-]+/)
const imageNameMatch = containerNameMatch

function isAny() {
  return true
}

function isString(val) {
  return typeof val === 'string'
}

function isInteger(val) {
  return validator.isInt(String(val))
}

function isTruthy(val) {
  switch(val) {
    case 1:
    case '1':
    case true:
    case 'true':
    case 'True':
    case 0:
    case '0':
    case false:
    case 'false':
    case 'False':
      return true;
    default:
      return false;
  }
}

function isDigest(val) {
  var str = String(val)
  return str.substr(0, 7) === 'sha256:' && validator.isBase64(str.substr(7))
}
