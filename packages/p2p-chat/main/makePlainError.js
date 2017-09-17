module.exports = (err) => {
  if (!err) return null
  const { message, stack, name } = err
  return { message, stack, name }
}
