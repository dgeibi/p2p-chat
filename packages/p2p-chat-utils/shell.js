const { exec, execSync } = require('child_process')

exports.shell = function shell(cmd = '', callback) {
  const proc = exec(cmd, (error) => {
    if (typeof callback === 'function') callback(error)
  })
  proc.stderr.pipe(process.stderr)
  proc.stdout.pipe(process.stdout)
  return proc
}

exports.shellSync = function shellSync(cmd = '') {
  execSync(cmd, { stdio: 'inherit' })
}
