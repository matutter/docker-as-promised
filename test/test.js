chai = require('chai')
chaiAsPromised = require('chai-as-promised')

chai.should();
chai.use(chaiAsPromised);

global.chaiAsPromised = chaiAsPromised;
global.expect = chai.expect;
global.AssertionError = chai.AssertionError;
global.Assertion = chai.Assertion;
global.assert = chai.assert;

//require('./docker_engine/validators.js')
require('./docker_engine/test.js')