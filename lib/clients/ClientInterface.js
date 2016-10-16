module.exports.inherits = inheritsClientInterface
module.exports.ClientInterface = ClientInterface

const util = require('util')
const Promise = require('bluebird')
const request = require('request')
const resolvers = require('./Resolvers.js')
const uris = require('./Uri.js')

const RequestError = require('./error').ResponseError

/**
* @typedef ClientInterface
* @description - A generic interface for any "client" making requests to either
* the docker/registry or docker/engine API
*
* The head, post, get, and delete methods are assigned by a generator closure
*/
function ClientInterface(opts, validator) {
  if(opts.socket) {
    this.uri = new uris.SocketUri(opts.socket, validator)
  } else if(opts.host && opts.port) {
    this.uri = new uris.HttpUri(opts.host, opts.port, 'v2', validator)
  } else {
    throw Error('Cannot determine URI configuration, expected socket or host & port')
  }
  this.resolve = resolvers
}

function inheritsClientInterface(clazz) {
  return util.inherits(clazz, ClientInterface)
}

/**
* Generator for basic http methods of the form (path, options)
*/
function BasicHttpMethod(proto, method) {
  var uppercase = method.toUpperCase()
  proto[method] = function(path, opts) {
    opts = opts || {}
    opts.method = uppercase
    opts.path = path
    return this.send(opts)
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
  return this.get('/_ping', {resolver: this.resolve.text})
};

ClientInterface.prototype.defaultResolver = function() {
  return this.resolve.json()
};

/*
* To be implemented by subclass
* May mutate the options for every request before it's sent.
*/
ClientInterface.prototype.before = function(opts) {};

ClientInterface.prototype.prepare = function(opts) {
  return new Promise((resolve, reject) => {
    try {

      const request_uri = this.uri.get(opts.path, opts.qs)

      const request_options = {
        uri : request_uri,
        method : opts.method,
        headers : opts.headers || {},
        resolver: opts.resolver || this.defaultResolver(),
        json: opts.json
      }

      if(request_options.json) {
        request_options.headers['Content-Type'] = 'application/json'
        request_options.json = JSON.stringify(request_options.json)
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

      if(!(200 <= res.statusCode && 300 > res.statusCode))
        return reject(new RequestError(res, opts.uri))

      try {
        resolve(request_options.resolver(res, body))
      } catch(e) {
        reject(e)
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