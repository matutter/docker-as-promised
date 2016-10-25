const engine = global.engine.instance || (new require('../../lib/clients/DockerEngine.js'))

const test_name = 'dap_test_container_2'
const test_image = 'alpine'
const test_command = ['/bin/touch', '/test.file']

describe(`containers.changes ${test_name}`, function() {

  this.timeout(6000)

  before('create and run container', () => {
    return engine.containers.create(test_name, {
      Image: test_image,
      Cmd: test_command,
      Tty: false,
      OpenStdin: false,
      StdinOnce: false,
      StopSignal: "SIGTERM"
    }).then(res => {
      assert(res.Id, 'response has no Id')
      assert(!res.Warnings, `response has Warnings [${res.Warnings}]`)
      return engine.containers.start(res.Id)
    }).catch(e => {
      console.error(e)
      throw e
    }).should.be.fulfilled
  })

  it(`should list the fs changes since creation`, () => {
    return engine.containers.changes(test_name).then(changes => {
      var touch = changes[0]
      assert.deepEqual(touch, { Path: '/test.file', Kind: 1})
    }).should.be.fulfilled
  })

  after('should remove the container', () => {
    return engine.containers.remove(test_name, {force:1})
      .catch(e => {
        if(e.statusCode != 404)
          throw e
      }).should.be.fulfilled
  })

})