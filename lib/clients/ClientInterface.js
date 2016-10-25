module.exports.inherits = inheritsClientInterface
module.exports.ClientInterface = ClientInterface

const util = require('util')
const Promise = require('bluebird')
const request = require('request')
const JSONStream = require('json-stream')
const Handlers = require('./Handlers.js')
const uris = require('./Uri.js')

const errors = require('./error')
const StatusError = errors.StatusError
const HandlerError = errors.HandlerError
const ValidationError = errors.ValidationError

/**
* @typedef ClientInterface
* @description - A generic interface for any "client" making requests to either
* the docker/registry or docker/engine API
*
* The head, post, get, and delete methods are assigned by a generator closure
*/
function ClientInterface(opts, parent) {
  if(parent) {
    this.uri = parent.uri
    this.before = parent.before
  } else if(opts.socket) {
    this.uri = new uris.SocketUri(opts.socket)
  } else if(opts.host && opts.port) {
    this.uri = new uris.HttpUri(opts.host, opts.port, 'v2')
  } else {
    throw Error('Cannot determine URI configuration, expected socket or host & port')
  }
  this.handle = Handlers
}

function inheritsClientInterface(clazz) {
  return util.inherits(clazz, ClientInterface)
}

/**
* Generator for basic http methods of the form (path, options)
*/
function BasicHttpMethod(proto, method) {
  var uppercase = method.toUpperCase()
  proto[method] = function(path, opts, validation) {
    opts = opts || {}
    opts.method = uppercase
    opts.path = path
    return this.send(opts, validation)
  }
}

BasicHttpMethod(ClientInterface.prototype, 'get')
BasicHttpMethod(ClientInterface.prototype, 'post')
BasicHttpMethod(ClientInterface.prototype, 'head')
BasicHttpMethod(ClientInterface.prototype, 'delete')

ClientInterface.prototype.defaultHandler = function() {
  return this.handle.json
};

/**
* 
*/
ClientInterface.prototype.send = function(opts, schema) {

  const request_options = {
    uri: null,
    method: opts.method,
    headers: opts.headers || {},
    handle: opts.handle || this.defaultHandler(),
    json: opts.json,
    body: opts.body,
    pipe: null
  }

  try {

    if(schema) {
      if(schema.qs) {
        schema.qs.validate(opts.qs)
      }

      if(schema.body) {
        schema.body.validate(opts.body)
      }
    }

    request_options.uri = this.uri.get(opts.path, opts.qs)

    // setup json-stream for incoming responses
    if(opts.pipe) {
      if(typeof opts.onData !== 'function')
        throw new Error('Expected "onData" callback')

      request_options.pipe = JSONStream()
    }
  } catch(e) {
    return Promise.reject(e)
  }

  return new Promise((resolve, reject) => {
    const onResponse = (e, res, body) => {
      if(e) return reject(e)

      if(!(200 <= res.statusCode && 300 > res.statusCode) && res.statusCode != opts.statusCode)
        return reject(new StatusError(res))

      try {
        resolve(request_options.handle(res, body))
      } catch(e) {
        reject(new HandlerError(e, res, body))
      }
    }

    this.before(request_options)

    //Object.freeze(request_options)

    if(opts.stream) {
      opts.stream.pipe(request(request_options, onResponse))
    } else {
      var req = request(request_options, onResponse)

      if(request_options.pipe) {
        req.on('close', resolve)

        request_options.pipe.on('data', data => {
          opts.onData(data, req)
        })

        req.pipe(request_options.pipe)
      }
    }
  })
};