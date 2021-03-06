module.exports.SocketUri = SocketURI
module.exports.HttpUri = HttpUri

const querystring = require('querystring')
const util = require('util')

function Uri() {}

Uri.prototype.host = function() { throw new Error('Not implemented') };
Uri.prototype.get = function() { throw new Error('Not implemented')};

function SocketURI(socket) {
  SocketURI.super_.call(this)

  this.host = () => 'localhost'
  this.get = (path, qs) => {
    qs = qs ? '?'+querystring.stringify(qs) : ''
    return `http://unix:${socket}:${path}${qs}`
  }
  return Object.freeze(this)
}
util.inherits(SocketURI, Uri)

function HttpUri(host, port, version) {
  HttpUri.super_.call(this)

  host = `${host}:${port}`
  version = version ? `${version}/` : ''

  this.host = () => host
  this.get = (path, qs) => {
    qs = qs ? '?'+querystring.stringify(qs) : ''
    return `http://${host}/${version}${path}${qs}`
  }

  return Object.freeze(this)
}
util.inherits(HttpUri, Uri)
