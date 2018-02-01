/**
 * Creates a stream to parse from ndjson-body.
 * @param {Array<Buffer>} chunks - array of buffers
 * @returns {?object}
 */
const parseChunks = chunks => {
  const buffer = Buffer.concat(chunks)
  try {
    return JSON.parse(buffer.toString())
  } catch (e) {
    return null
  }
}

module.exports = parseChunks
