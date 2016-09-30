const querystring = require('querystring')

function b64Transform(obj) {
  return new Buffer(JSON.stringify(obj)).toString('base64')
}

module.exports.images = {
  all: null,
  filter: null,
  digests: null,
  filters: b64Transform
}

module.exports.containers = {
  all: null,
  limit: null,
  since: null,
  before: null,
  size: null,
  filters: b64Transform
}

module.exports.imageHistory = {
  tag: null
}

function ApiWrapper(api) {
  this.keys = Object.keys(api)
  this.transforms = {}
  this.keys.forEach(key => {
    var value = api[key]
    // transform
    if(typeof value === 'function') 
      this.transforms[key] = value
  })
}

ApiWrapper.prototype.assign = function(opts) {
  var obj = {}
  var key = null
  var keys = Object.keys(opts)
  for(var i =0; i<keys.length; ++i) {
    key = keys[i]
    if(~this.keys.indexOf(key)) {
      if(this.transforms[key])
        obj[key] = this.transforms[key](opts[key])
      else
        obj[key] = opts[key]
    }
  }
  return obj
};

ApiWrapper.prototype.qs = function(opts) {
  return opts ? querystring.stringify(this.assign(opts)) : ''
};

Object.keys(module.exports).forEach(api => {
  module.exports[api] = new ApiWrapper(module.exports[api])
})

