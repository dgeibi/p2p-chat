export default {
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value))
  },
  get(key) {
    try {
      return JSON.parse(localStorage.getItem(key))
    } catch (e) {
      return null
    }
  },
}
