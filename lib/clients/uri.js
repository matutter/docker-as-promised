module.exports.SocketUri = SocketURI
module.exports.HttpUri = HttpUri

function SocketURI(socket) {
  this.host = 'localhost'
  this.get = (path) => `http://unix:${socket}:/${path}`
}

function HttpUri(host, port) {
  var host = `${host}:${port}`
  this.host = host
  this.get = (path) => `http://${host}/${path}`
}