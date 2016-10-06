module.exports.Validator = Validator
module.exports.inherits = inherits

const util = require('util')

/**
* @typedef Validator
* Provides a "validates" method which will prune and type-check qs parameters. 
* @param map - an object of the form { '/url/pathname' : { query_key: CheckFunction } } }
*/
function Validator(map) {
  this.map = map
}

function inherits(clazz) {
  util.inherits(clazz, Validator)
}

Validator.prototype.getValidators = function(pathname) {
  const validators = this.map[pathname]

  if(!validators) throw new Error(`Pathname "${pathname}" does not support validation.`)

  return validators()
};

Validator.prototype.validates = function(pathname, qs) {
  const validators = this.getValidators(pathname)
  var assigned = false
  var result = {}

  Object.keys(qs).forEach(k => {
    var v = qs[k]
    
    if(v === undefined) return

    var validator = validators[k]
    if(validator) {
      if(validator(v)) {
        result[k] = v
        assigned = true        
      } else {
        throw new TypeError(`Invalid query value "${k}=${v}"`)
        //console.log(`invalidates property "${k}" with value "${v}"`)
      }
    } else {
      //console.log(`sanitized property "${k}"`)
    }
  })

  return assigned ? result : null
}