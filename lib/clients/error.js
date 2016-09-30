'use strict';
module.exports.ResponseError = ResponseError;

const util = require('util')

function ResponseError(res, uri) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.uri = res.request.href
  this.message = res.body;
  this.getResponse = ()=> res;
};
util.inherits(ResponseError, Error);
