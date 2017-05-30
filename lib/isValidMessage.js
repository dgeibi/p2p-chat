const checkProps = require('./utils/checkProps');

const isValidMessage = (message) => {
  if (!message) return false;
  const wrongs = checkProps(message, {
    type: { type: 'string' },
    tag: { type: 'string' },
    username: { type: 'string' },
  });
  if (wrongs.length > 0) {
    wrongs.forEach(err => console.error(err));
    return false;
  }
  return true;
};

module.exports = isValidMessage;
