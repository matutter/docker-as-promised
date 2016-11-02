module.exports.find = find
module.exports.parse = parse
module.exports.Type = Type

const validator = require('validator')

function Type(type, validate, defaultValue, required) {
  this.type = type.type || type

  if(typeof validate === 'function') {
    this.validate = validate
  } else if(validate instanceof RegExp) {
    this.validate = o => validate.test(o)
  } else if(Array.isArray(validate)) {

  } else {
    throw new TypeError(`Type(${this.type}).validate, expected Function or RegExp`)
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
module.exports.String = StringType

const BooleanType = new Type(Boolean, o => typeof o === 'boolean')
module.exports.Boolean = BooleanType

const IntegerType = new Type('Integer', o => validator.isInt(String(o)))
module.exports.Integer = IntegerType

const AnyType = new Type('Any', o => true)
module.exports.Any = AnyType

const DigestType = new Type('Digest', /^sha256:[a-zA-Z0-9]{64}$/)
module.exports.Digest = DigestType

const TruthyType = new Type('Truthy', /^([01]|true|false)&/ig)
module.exports.Truthy = TruthyType

const IPv4Type = new Type('IPv4', o => validator.isIP(o, 4))
module.exports.IPv4 = IPv4Type

const IPv6Type = new Type('IPv6', o => validator.isIP(o, 6))
module.exports.IPv6 = IPv6Type

function parse(opts) {

  if(opts instanceof Type) return opts

  if(typeof opts === 'function')
    return find(opts)

  if(Array.isArray(opts)) {
    opts = opts[0]
  }

  var base = find(opts)

  var type = new Type(
    base.type,
    opts.validate || base.validate,
    opts.defaultValue || opts.default,
    opts.required 
  )

  return type
};

function find(type) {

  if(type.type)
    type = type.type

  // if is a primitive
  if(typeof type === 'function')
  switch(type) {
    case String: return StringType
    case Boolean: return BooleanType
    default:
      throw new TypeError(`Unrecognized SchemaType "${type}"`)
  }

  if(typeof type === 'string')
  switch(type.type) {
    case TruthyType.type: return TruthyType
    case IntegerType.type: return IntegerType
    case AnyType.type: return AnyType
    case IPv4Type.type: return IPv4Type
    case IPv6Type.type: return IPv6Type
  }

  throw new TypeError(`Unrecognized SchemaType "${type}"`)
}