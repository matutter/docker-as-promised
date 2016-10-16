module.exports.inherits = inheritsClientInterface
module.exports.ClientInterface = ClientInterface

const util = require('util')
const Promise = require('bluebird')
const request = require('request')
const Handlers = require('./Handlers.js')
const uris = require('./Uri.js')

const errors = require('./error')
const StatusError = errors.StatusError
const HandlerError = errors.HandlerError
const validationError = errors.validationError

/**
* @typedef ClientInterface
* @description - A generic interface for any "client" making requests to either
* the docker/registry or docker/engine API
*
* The head, post, get, and delete methods are assigned by a generator closure
*/
function ClientInterface(opts) {
  if(opts.socket) {
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

/**
* https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/ping-the-docker-server
* GET /_ping HTTP/1.1
* HTTP/1.1 200 OK
* Content-Type: text/plain
* OK
*/
ClientInterface.prototype.ping = function() {
  return this.get('/_ping', {handle: this.handle.text})
};

ClientInterface.prototype.defaultHandler = function() {
  return this.handle.json()
};

/*
* To be implemented by subclass
* May mutate the options for every request before it's sent.
*/
ClientInterface.prototype.before = function(opts) {};

ClientInterface.prototype.prepare = function(opts, validation) {
  return new Promise((resolve, reject) => {

    try {
      if(validation) {
        if(validation.qs && opts.qs) {
          opts.qs = validation.qs(opts.qs)
        }

        if(validation.body && (opts.body || opts.json)) {
          opts.body = validation.body(opts.body || opts.json)
        }
      }
    } catch(e) {
      reject(new ValidationError(e))
    }

    try {
      const request_uri = this.uri.get(opts.path, opts.qs)

      const request_options = {
        uri : request_uri,
        method : opts.method,
        headers : opts.headers || {},
        handle: opts.handle || this.defaultHandler(),
        json: (opts.json ? true : false), // so we can shorthand parameters early
        body: opts.body || opts.json
      }

      if(request_options.json) {
        request_options.headers['Content-Type'] = 'application/json'
      }

      resolve(request_options)
    } catch(e) {
      reject(e)
    }   
  })
};

/**
* 
*/
ClientInterface.prototype.send = function(opts) {
  return this.prepare(opts).then(request_options => new Promise((resolve, reject) => {
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

    //console.log(' > ', request_options.uri)

    if(opts.stream) {
      opts.stream.pipe(request(request_options, onResponse))
    } else {
      request(request_options, onResponse)
    }
  }))
};