'use strict';
module.exports.StatusError = StatusError;
module.exports.ContentError = ContentError;

const util = require('util')

function StatusError(res) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.uri = res.request.href
  this.message = `code ${res.statusCode}: ${res.body.message || res.body}`
  this.statusCode = res.statusCode
  this.getResponse = ()=> res;
  try {
    this.data = JSON.parse(res.body)
    this.data = this.data.errors || this.data
  } catch(e) {
    this.data = e
  }
};
util.inherits(StatusError, Error);

function ContentError(e, res) {
  ContentError.super_.call(this, res)
  this.uri = res.request.href
  this.originalError = e
  this.message = e.message 
  this.content = res.body
}
util.inherits(ContentError, StatusError);
