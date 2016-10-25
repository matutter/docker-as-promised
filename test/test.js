fs = require('fs')
path = require('path')
chai = require('chai')
chaiAsPromised = require('chai-as-promised')
Promise = require('bluebird')

chai.should();
chai.use(chaiAsPromised);

global.chaiAsPromised = chaiAsPromised;
global.expect = chai.expect;
global.AssertionError = chai.AssertionError;
global.Assertion = chai.Assertion;
global.assert = chai.assert;

global.__lib  = __lib = path.resolve('./lib')
global.__schemas  = __schemas = __lib + '/schemas'

/*console.log(fs.readdirSync(__lib))
console.log(fs.readdirSync(__schemas))
console.log(fs.readdirSync(__module))*/

global.printError = printError = function(e) {
  console.error(e)
  throw e
}

global.wait = wait = function(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

require('./misc.js')
require('./schema/test.js')
require('./docker_engine/test.js')