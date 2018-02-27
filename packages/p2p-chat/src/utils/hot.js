export default ({ sourceModule, replaceGetter, args }) => {
  if (process.env.NODE_ENV !== 'production' && sourceModule.hot) {
    sourceModule.hot.accept()
    sourceModule.hot.dispose(data => {
      const replace = replaceGetter()
      if (typeof replace === 'function') {
        // eslint-disable-next-line
        data.replace = replace
      }
    })
    if (sourceModule.hot.data && typeof sourceModule.hot.data.replace === 'function') {
      sourceModule.hot.data.replace.apply(null, args)
    }
  }
}
