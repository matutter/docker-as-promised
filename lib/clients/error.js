'use strict';
module.exports.ResponseError = ResponseError;

const util = require('util')

function ResponseError(res) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = `Unexpected HTTP Response, ${res.statusCode}`;
  this.HTTPResponse = res;
};
util.inherits(ResponseError, Error);
