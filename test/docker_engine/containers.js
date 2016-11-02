
const engine = global.engine.instance || (new require('../../lib/clients/DockerEngine.js'))

const test_name = 'dap_test_container'
const test_image = 'alpine'
const test_command = ['/usr/bin/tail', '-f', '/dev/null']

describe(`containers.create name:${test_name} Image:${test_image}`, ()=> {

  before('delete the container if it exists', () => {
    return engine.containers.remove(test_name, {force:1})
      .catch(e => {
        if(e.statusCode != 404)
          throw e
      }).should.be.fulfilled
  })

  it(`should create a container named ${test_name} from ${test_image}`, () => {
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
    }).catch(e => {
      console.error(e)
      throw e
    }).should.be.fulfilled
  })

  after('wait for latency', () => wait(1000))
})

describe(`containers.start ${test_name}`, function() {

  it(`should start the container named ${test_name}`, () => {
    return engine.containers.start(test_name).catch(printError).should.be.fulfilled
  })
})

describe('containers.list filter { status: running }', () => {
  it('should list all running containers', () => {
    return engine.containers.list({filters: {status:'running'}}).then(list => {
      //console.log(list)
    }).should.be.fulfilled
  })
})

describe(`containers.stats ${test_name}`, () => {
  it('should return one system resources stats (because stream:0 w/o callback for stream)', () => {
    return engine.containers.stats(test_name).then(stats => {
      assert(stats.read)
      assert(stats.precpu_stats)
      assert(stats.cpu_stats)
      assert(stats.memory_stats)
    }).should.be.fulfilled
  })
})

describe(`containers.stats ${test_name} Function(data, stream)`, function() {
  this.timeout(10000)

  it('should a system resources stats stream', () => {
    var count = 3
    return engine.containers.stats(test_name, (data, stream) => {
      count--
      if(count < 0) {
        stream.abort()
      }
    }).then(() => {
    }).should.be.fulfilled
  })
})

describe(`containers.top ${test_name} ps_args:aux`, () => {
  it(`should list ${test_command}`, () => {
    return engine.containers.top(test_name, {ps_args: 'aux'}).then(ps => {
      var proc = ps.Processes[0]
      var command = proc[proc.length -1]
      assert.equal(command, test_command.join(' '))
    }).should.be.fulfilled
  })
})

describe(`containers.inspect ${test_name}`, () => {
  it('should return low level info object', () => {
    return engine.containers.inspect(test_name).then(info => {
      assert.equal(info.Name, `/${test_name}`)
      assert(info.State.Running, 'Last test should START the container, but it was not running')
    }).should.be.fulfilled
  })
})

describe(`containers.stop ${test_name} t:0`, () => {
  it(`should stop the container named ${test_name}`, () => {
    return engine.containers.stop(test_name, {t:0}).should.be.fulfilled
  })
})

describe(`containers.inspect ${test_name} size:1`, () => {

  before('wait for latency', () => wait(1000))

  it('should return low level info object with size data', () => {
    return engine.containers.inspect(test_name, {size:1}).then(info => {
      assert.isNumber(info.SizeRw)
      assert.isNumber(info.SizeRootFs)
      assert(!info.State.Running, 'Last test should STOP the container, but it was not running')
    }).should.be.fulfilled;
  })
})

describe('containers.list limit:2', () => {
  it('should list containers', () => {
    return engine.containers.list({limit: 2}).then(list => {
      assert(list.length <= 2)
      assert(list.length != 0, 'There are no containers to test with!')
      // every container has an ID
      assert(list.every(container => container.Id))
    }).should.be.fulfilled
  })
})

describe(`containers.remove ${test_name} v:1 `, () => {

  before('wait for latency', () => wait(1000))

  it(`should remove the container named ${test_name} & volumes`, () => {
    return engine.containers.remove(test_name, {v:1}).should.be.fulfilled;
  })
})