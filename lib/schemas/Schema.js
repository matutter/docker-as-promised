module.exports = Schema

const Types = require('./Types.js')

function Schema(name, definition) {
  this.name = name
  this.definition = {}
  this.keys = Object.keys(definition)
  this.hasRequired = false
  const base = {}

  this.keys.forEach(key => {
    var def = definition[key]

    this.definition[key] = def = Types.parse(def)

    if(def.default) {
      base[key] = def.defaultValue
    } else {
      base[key] = undefined
    }

    if(def.required) this.hasRequired = true
  })

  this.base = Object.seal(base)
}

Schema.Types = Types

Schema.prototype.validate = function(data) {

  if(data === null || data === undefined) {
    if(this.hasRequired) {
      throw new Error('Schema has required fields')
    } else {
      return data
    }
  }

  var dataKeys = Object.keys(data)
  for(var i = 0; i < dataKeys.length; ++i) {
    var key = dataKeys[i]
    if(~this.keys.indexOf(key)) continue
    
    throw new Error(`Unexpected key ${key} in Schema.${this.name}`)
  }

  const obj = {}

  for(var i = 0; i < this.keys.length; ++i) {
    var key = this.keys[i]
    var val = data[key]
    var def = this.definition[key]

    if(!def) {
      continue
    }

    if(val === undefined || val === null) {
      if(def.default) {
        obj[key] = def.defaultValue
      } else if(def.required) {
        throw new Error(`Missing required property "${key}" in "${this.name}"`)
      }
    } else {
      def.typecheck(val)
      obj[key] = val
    }
    
  }

  return obj
};