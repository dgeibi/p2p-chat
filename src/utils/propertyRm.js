export default (obj, ...args) => {
  if (!obj) return null
  const newObj = { ...obj }
  args.forEach((key) => {
    delete newObj[key]
  })
  return newObj
}
