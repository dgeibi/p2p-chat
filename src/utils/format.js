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
  if (str.length > 20) {
    return `${str.slice(0, 8)}..${str.slice(-8)}`
  }
  return str
}

export const formatTag = tag => `[${tag.slice(0, 5)}]`
