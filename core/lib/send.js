const bufferFrom = require('./utils/bufferFrom');
const isValidMessage = require('./isValidMessage');

module.exports = function send(socket, message) {
  if (!isValidMessage(message)) throw TypeError('Invalid Message');
  const buffer = bufferFrom(message);
  socket.write(buffer);
  return m => socket.write(m);
};
