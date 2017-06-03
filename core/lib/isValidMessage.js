const checkProps = require('./utils/checkProps');
const logger = require('logger');

const isValidMessage = (message) => {
  if (!message) return false;
  const wrongs = checkProps(message, {
    type: { type: 'string' },
    tag: { type: 'string' },
    username: { type: 'string' },
    port: { type: 'number' },
    host: { type: 'string' },
  });
  if (wrongs.length > 0) {
    wrongs.forEach(err => logger.error(err));
    return false;
  }
  return true;
};

module.exports = isValidMessage;
