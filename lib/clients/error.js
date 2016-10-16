'use strict';
module.exports.ResponseError = ResponseError;

const util = require('util')

function ResponseError(res, uri) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.uri = res.request.href
  this.message = res.body.message || res.body;
  this.getResponse = ()=> res;
  try {
    this.data = JSON.parse(res.body)
    this.data = this.data.errors || this.data
  } catch(e) {}
};
util.inherits(ResponseError, Error);
