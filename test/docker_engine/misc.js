
//const DockerEngine = require('../../lib/clients/DockerEngine.js')
const validates = require('../../lib/validation').engine
const version = global.engine.version
const engine = global.engine.instance

describe('query-string & body sanitization removes excess properties', () => {

  const valid_output = {
    containers_list : {
      all : 1,
      limit : 2,
      since: 'sha256:0123456789ABCDEF',
      before: 'sha256:0123456789ABCDEF',
      size: 1,
      filters: {}
    },
    create_container_name : { name: 'name' },
    create_container_body : { Image: '/name' },
    inspect_container : { size: 1 },
    remove_container : { v : 'True', force : false }
  }

  const valid_input = {
    containers_list : {
      all : 1, extra:'gets removed',
      limit : 2,
      since: 'sha256:0123456789ABCDEF',
      before: 'sha256:0123456789ABCDEF',
      size: 1,
      filters: {}
    },
    create_container_name : { name: 'name' },
    create_container_body : { Image: '/name' },
    inspect_container : { size: 1 },
    remove_container : { v : 'True', force : false }
  }

  for(key in validates) {
    const validator = validates[key]
    const expect = valid_output[key]
    const input = valid_input[key]

    assert(typeof validator === 'function', `validator ${key} not a function. (actual type ${typeof validator})`)
    it(`should sanitize engine.${key}`, () => {
      validator(input).then(result => assert.deepEqual(result, expect)).should.be.fulfilled     
    })
  }
})

describe('query-string & body validation throws errors on invalid types', ()=> {
  const invalid_input = {
    containers_list : {
      all : 'not truthy', extra:'gets removed',
      limit : 'not a number',
      since: '0123456789ABCDEF',
      before: 'sha256:0123456789ABCDEF',
      size: 1,
      filters: {}
    },
    create_container_name : { name: '123 unexpected/name' },
    create_container_body : { Image: 'xxx malformed/name' },
    inspect_container : { size: 'something else' },
    remove_container : { v : 'True+False', force : {} }
  }

  for(key in validates) {
    const validator = validates[key]
    const input = invalid_input[key]

    assert(typeof validator === 'function', `validator ${key} not a function. (actual type ${typeof validator})`)
    it(`should sanitize engine.${key}`, () => {
      validator(input).should.be.rejected
    })
  }
})

describe('version', () => {
  it(`should be ${version}`, () => {
    return engine.version().then(info => {
      assert.equal(info.ApiVersion, version, `API version mismatch | expected ${version}, found ${info.ApiVersion}`)
    }).should.be.fulfilled
  })
})

/*

    it(`should throw a TypeError with incorrect qs value types`, () => {
      return engine.listContainers({limit:'NaN'}).should.be.rejectedWith(TypeError)
    })

describe('', () => {})

    describe('validators help prevent malformed queries', () => {
      
      describe('engine.listContainers', () => {
        it('validates all, limit, since, before, size, ', () => {
          return engine.listContainers({limit: 1, all: '0', size: true, since : 'sha256:0123456789ABCDEF'}).should.be.fulfilled
        })
      })

      describe('engine.ping', () => {
        it('has no parameters', () => {
          return engine.ping().should.be.fulfilled
        })
      })

    })

    */