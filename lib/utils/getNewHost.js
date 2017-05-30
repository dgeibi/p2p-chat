function getParts(parts, zero = true) {
  const last = parts[parts.length - 1];
  if (last < 254) return [...parts.slice(0, parts.length - 1), last + 1];
  return [...getParts(parts.slice(0, parts.length - 1)), zero ? 0 : 1];
}

function getNewHost(host) {
  const parts = host.split('.').map(Number);
  return getParts(parts, false).join('.');
}

module.exports = getNewHost;
