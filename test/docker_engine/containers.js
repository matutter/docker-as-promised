
const engine = global.engine.instance || (new require('../../lib/clients/DockerEngine.js'))

const test_name = 'dap_test_container'
const test_image = 'alpine'
const test_command = 'tail -f /dev/null'.split(' ')

describe(`createContainer name:${test_name} Image:${test_image}`, ()=> {

  before('delete the container if it exists', () => {
    return engine.removeContainer(test_name, {force:1})
      .catch(e => {
        if(e.statusCode != 404)
          throw e
      }).should.be.fulfilled
  })

  it(`should create a container named ${test_name} from ${test_image}`, () => {
    return engine.createContainer(test_name, {Image: test_image, Cmd: test_command}).then(res => {
      assert(res.Id, 'response has no Id')
      assert(!res.Warnings, `response has Warnings [${res.Warnings}]`)
    }).catch(e => {
      throw e
    }).should.be.fulfilled
  })
})

describe(`startContainer ${test_name}`, () => {
  it(`should start the container named ${test_name}`, () => {
    return engine.startContainer(test_name).should.be.fulfilled
  })
})

describe('listContainers filter { status: running }', () => {
  it('should list all running containers', () => {
    return engine.listContainers({filter: {status:'running'}}).then(list => {
      //console.log(list)
    }).should.be.fulfilled
  })
})

describe(`inpectContainer ${test_name}`, () => {
  it('should return low level info object', () => {
    return engine.inspectContainer(test_name).then(info => {
      assert.equal(info.Name, `/${test_name}`)
      assert(info.State.Running, 'Last test should START the container, but it was not running')
    }).should.be.fulfilled
  })
})

describe(`stopContainer ${test_name} t:0`, () => {
  it(`should stop the container named ${test_name}`, () => {
    return engine.stopContainer(test_name, {t:0}).should.be.fulfilled
  })
})

describe(`inpectContainer ${test_name} size:1`, () => {

  before('wait for latency', () => wait(1000))

  it('should return low level info object with size data', () => {
    return engine.inspectContainer(test_name, {size:1}).then(info => {
      assert.isNumber(info.SizeRw)
      assert.isNumber(info.SizeRootFs)
      assert(!info.State.Running, 'Last test should STOP the container, but it was not running')
    }).should.be.fulfilled;
  })
})

describe('listContainers limit:2', () => {
  it('should list containers', () => {
    return engine.listContainers({limit: 2}).then(list => {
      assert(list.length <= 2)
      assert(list.length != 0, 'There are no containers to test with!')
      // every container has an ID
      assert(list.every(container => container.Id))
    }).should.be.fulfilled
  })
})

describe(`removeContainer ${test_name} v:1 `, () => {

  before('wait for latency', () => wait(1000))

  it(`should remove the container named ${test_name} & volumes`, () => {
    return engine.removeContainer(test_name, {v:1}).should.be.fulfilled;
  })
})