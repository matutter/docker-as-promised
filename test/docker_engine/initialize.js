
const DockerEngine = require('../../lib/clients/engine')
const socket = global.engine.socket

describe(`new DockerEngine defaults`, () => {
  it(`should use "${socket}" as it's default uri`, () => {
    var uri = new DockerEngine().uri.get('')
    assert(~uri.indexOf(socket))
  })
})

describe('new DockerEngine { socket: uri }', () => {
  it('should use the specified socket uri', () => {
    var engine = new DockerEngine({ socket: '/var/run/docker.sock' })
    assert(~engine.uri.get('').indexOf(socket))
  })
})