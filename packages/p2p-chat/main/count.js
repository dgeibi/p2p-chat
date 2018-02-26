export default function count(limit = 4) {
  let tick = 0
  return () => {
    if (tick > limit) return false
    tick += 1
    return true
  }
}
