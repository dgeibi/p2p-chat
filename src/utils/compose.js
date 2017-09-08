export default function compose(...fns) {
  return (...args) =>
    fns.forEach((x) => {
      if (x) {
        x(...args)
      }
    })
}
