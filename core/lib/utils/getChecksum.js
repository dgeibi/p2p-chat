const crypto = require('crypto');

const getChecksum = data => crypto.createHash('md5').update(data).digest('hex');

module.exports = getChecksum;
