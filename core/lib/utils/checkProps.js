const TYPEOFS = [
  'symbol',
  'undefined',
  'boolean',
  'number',
  'string',
  'function',
];

function addTypeWrong(key, value, type, wrongs) {
  // eslint-disable-next-line valid-typeof
  if (TYPEOFS.includes(type) && typeof value !== type) {
    wrongs.push(TypeError(`${key} should be ${type}`));
  }
}

function addClassWrong(key, value, constructor, wrongs) {
  if (!(value instanceof constructor)) {
    wrongs.push(TypeError(`${key} should be a ${constructor.name}`));
  }
}

function checkProp({ object, key, type, Instance, wrongs = [] }) {
  const value = object[key];
  if (Array.isArray(type)) {
    type.forEach((str) => {
      addTypeWrong(key, value, str, wrongs);
    });
  } else if (type) {
    addTypeWrong(key, value, type, wrongs);
  }
  if (Array.isArray(Instance)) {
    Instance.forEach((func) => {
      if (typeof func === 'function') addClassWrong(key, value, func, wrongs);
    });
  } else if (typeof Instance === 'function') {
    addClassWrong(key, value, Instance, wrongs);
  }
  return wrongs;
}

function checkProps(object, des) {
  const wrongs = [];
  Object.keys(des).forEach((key) => {
    checkProp({
      object,
      key,
      wrongs,
      Instance: des.Instance,
      type: des.type,
    });
  });
  return wrongs;
}

module.exports = checkProps;
