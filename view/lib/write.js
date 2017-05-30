/* eslint-disable no-param-reassign */

const dateFormat = require('dateformat');
const formatTag = require('./formatTag');

module.exports = (view, local) => {
  const write = (str) => {
    view.insertAdjacentHTML('beforeend', str);
    setTimeout(() => {
      view.scrollTop = view.scrollHeight;
    }, 0);
  };

  const writeMonthDay = () => {
    write(`<section class="info center">${dateFormat(new Date(), 'mm-dd')}</section>`);
  };

  const writeTime = () => {
    write(`<section class="info center">${dateFormat(new Date(), 'HH:MM')}</section>`);
  };

  const writeMsg = (text) => {
    write(`<section class="info">${text}</section>`);
  };

  const writeUserMsg = (tag, username, text) => {
    if (local.msgCount % 5 === 0) writeTime();
    local.msgCount += 1;
    write(`<section><span class="info">${username}[${formatTag(tag)}]:</span> ${text}</section>`);
  };

  return {
    write,
    writeMonthDay,
    writeMsg,
    writeTime,
    writeUserMsg,
  };
};
