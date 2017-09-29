const IPset = require('p2p-chat-utils/ipset')

module.exports = function ensureMergeIPset(payload) {
  const { ipset, ipsetMerged, ipsetStore } = payload
  const ret = {}
  if (ipset) {
    ret.ipset = ipsetMerged ? ipset : ipset.mergeStore(ipsetStore)
    ret.ipsetMerged = true
  } else {
    ret.ipset = IPset(ipsetStore)
  }
  return Object.assign(payload, ret)
}
