module.exports.find = find
module.exports.parse = parse
module.exports.Type = Type

const validator = require('validator')

function Type(type, typecheck, defaultValue, required) {
  this.type = type.type || type

  if(typeof typecheck === 'function') {
    this.typecheck = typecheck
  } else if(typecheck instanceof RegExp) {
    this.typecheck = o => typecheck.test(o)
  } else {
    throw new TypeError('Type.typecheck, expected Function or RegExp')
  }

  this.default = false
  this.defaultValue = undefined
  this.required = required || false

  if(defaultValue !== undefined && defaultValue !== null) {
    this.default = true
    this.defaultValue = defaultValue
  }
}

Type.parse = parse

const StringType = new Type(String, o => typeof o === 'string')
const BooleanType = new Type(Boolean, o => typeof o === 'boolean')
const IntegerType = new Type('Integer', o => validator.isInt(String(o)))
module.exports.Integer = IntegerType

const AnyType = new Type('Any', o => true)
module.exports.Any = AnyType

const DigestType = new Type('Digest', /^sha256:[a-zA-Z0-9]{64}$/)
module.exports.Digest = DigestType

const TruthyType = new Type('Truthy', /^([01]|true|false)&/ig)
module.exports.Truthy = TruthyType

function parse(opts) {

  if(opts instanceof Type) return opts

  if(typeof opts === 'function')
    return find(opts)

  var base = find(opts.type)
  
  var type = new Type(
    base.type,
    opts.typecheck || base.typecheck,
    opts.defaultValue || opts.default,
    opts.required 
  )

  return type
};

function find(type) {

  // if is a primitive
  switch(type) {
    case String: return StringType
    case Boolean: return BooleanType
    case TruthyType.type: return TruthyType
    case IntegerType.type: return IntegerType
    default:
      throw new TypeError(`Unrecognized SchemaType "${type}"`)
  }
}