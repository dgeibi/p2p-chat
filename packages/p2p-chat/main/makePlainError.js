export default err => {
  if (!err) return null
  const { message, stack, name, code, errno, syscall } = err
  return { message, stack, name, code, errno, syscall, ...err }
}
