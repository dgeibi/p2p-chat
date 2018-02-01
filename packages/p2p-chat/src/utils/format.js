export function formatSize(size) {
  if (size > 1e9) return `${toFixed(size / 1e9)} GB`
  else if (size > 1e6) return `${toFixed(size / 1e6)} MB`
  else if (size > 1e3) return `${toFixed(size / 1e3)} KB`
  return `${toFixed(size)} B`
}

export function formatSpeed(speed) {
  return `${formatSize(speed)}/s`
}

function toFixed(num) {
  return num.toFixed(2)
}

export function formatPercent(percent) {
  return Number((percent * 100).toPrecision(3))
}

export function formatName(str) {
  // non-ASCII character may be wider
  // eslint-disable-next-line
  if (str.length > 14 && /[^\x00-\x7F]/.test(str)) {
    return `${str.slice(0, 6)}..${str.slice(-7)}`
  }
  if (str.length > 22) {
    return `${str.slice(0, 9)}..${str.slice(-9)}`
  }
  return str
}

export const formatTag = tag => `[${tag.slice(0, 5)}]`
