const V = {}
module.exports = V

const validator = require('validator')

function EmptyParams(qs) {
  if(qs) throw new Error('Endpoint does not support querystring')
  return false
}

V['/_ping'] = EmptyParams

function ContainerParams(qs) {
  return validate(qs, {
    limit : validator.isNumber
  })
}

V['/containers/json'] = ContainerParams

function validate(qs, validators) {
  var assigned = false
  var result = {}

  Object.keys(qs).forEach(k => {
    var v = qs[k]
    
    if(v === undefined) return

    var validator = validators[k]
    if(validator && validator(v)) {
      result[k] = v
      assigned = true
    }
  })

  return assigned ? result : null
}