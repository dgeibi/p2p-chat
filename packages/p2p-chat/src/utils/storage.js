export default {
  get(k) {
    try {
      return JSON.parse(sessionStorage.getItem(k))
    } catch (e) {
      return null
    }
  },
  set(k, v) {
    sessionStorage.setItem(k, JSON.stringify(v))
  },
}
