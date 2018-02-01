/* eslint-disable no-param-reassign, no-continue, no-underscore-dangle */
const net = require('net')
const getNewHost = require('p2p-chat-utils/get-new-address')
const isIPLarger = require('p2p-chat-utils/is-ip-larger')

function connectScatter(opts, fallbackHost) {
  if (opts.connects) {
    opts.connects.forEach(conn => {
      const host = conn.host || fallbackHost
      const { port } = conn
      opts.ipset.add(host, port)
    })
    opts.connects = undefined
  }
}

const noop = () => {}
function connectIPset(ipset, handler) {
  ipset.forEach((host, port) => {
    net.connect(port, host, handler).on('error', noop)
  })
}

function connectRange(opts, fallbackHost) {
  const { hostStart, portStart, ipset } = opts
  let { hostEnd, portEnd } = opts

  if (!portStart) return
  if (portEnd && portEnd < portStart) return
  if (hostStart && !hostEnd) hostEnd = hostStart

  if (!portEnd) portEnd = portStart + 1
  else portEnd += 1

  if (hostStart) {
    for (let port = portStart; port < portEnd; port += 1) {
      connectHostRange(hostStart, hostEnd, port, ipset)
    }
  } else {
    const host = fallbackHost
    for (let port = portStart; port < portEnd; port += 1) {
      ipset.add(host, port)
    }
  }
}

/**
 * 将 from ~ to 范围内的地址添加到 ipset
 * @param {string} from
 * @param {string} to
 * @param {number} port
 * @param {object} ipset
 */
function connectHostRange(from, to, port, ipset) {
  if (isIPLarger(from, to)) return // 超过范围
  ipset.add(from, port)
  connectHostRange(getNewHost(from), to, port, ipset)
}

module.exports = {
  connectIPset,
  connectRange,
  connectScatter,
}
