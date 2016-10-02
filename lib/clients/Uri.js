module.exports.SocketUri = SocketURI
module.exports.HttpUri = HttpUri

function SocketURI(socket) {
  this.host = 'localhost'
  this.get = (path) => `http://unix:${socket}:/${path}`
}

function HttpUri(host, port, path_prefix) {
  var host = `${host}:${port}`
  path_prefix = path_prefix ? `${path_prefix}/` : ''
  this.host = host
  this.get = (path) => `http://${host}/${path_prefix}${path}`
}