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


global.wait = wait = function(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

//describe('JSONStream', () => {
  //require('./json_stream/json_stream.js')
//})

//require('./docker_engine/validators.js')
require('./docker_engine/test.js')