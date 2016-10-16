module.exports.Validator = Validator
module.exports.inherits = inherits

const util = require('util')
const Promise = require('bluebird')

/**
* @typedef Validator
* Provides a "validates" method which will prune and type-check qs parameters. 
* @param map - an object of the form { '/url/pathname' : { query_key: CheckFunction } } }
*/
function Validator(map) {
  //this.map = map
  Object.keys(map).forEach(key => {
    var validators = map[key]
    this[key] = qs => this.validates(validators, qs)
  })
}

function inherits(clazz) {
  util.inherits(clazz, Validator)
}

Validator.prototype.validates = function(validators, qs) {
  const keys = Object.keys(qs)
  var res = {}

  for(var i = 0; i < keys.length; ++i) {
    var k = keys[i]
    var v = qs[k]
    var validator = validators[k]
    
    if(v === undefined) continue
    if(validator === undefined) continue

    if(validator(v)) {
      res[k] = v
    } else {
      return Promise.reject(new TypeError(`Invalid query value "${k}=${v}"`))
    }
  }

  return Promise.resolve(res)
}