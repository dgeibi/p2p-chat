/* eslint-disable no-underscore-dangle */
const splicer = require('stream-splicer');
const { Serialize, Parse } = require('./ndjsonBody');

const jsonStream = (stream) => {
  const pipeline = splicer.obj([Serialize(), stream, Parse()]);
  pipeline.orig = stream;
  return pipeline;
};

module.exports = jsonStream;
