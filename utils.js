const childProcess = require('child_process')
const path = require('path')

module.exports.getSpagoAbsoluteOutputDir = function getSpagoAbsoluteOutputDir() {
  const command = "spago path output"

  const stdout = childProcess.execSync(command)

  const relativePath = stdout.toString().trim()

  const absolutePath = path.resolve(relativePath)

  // console.log(`[spago-loader] spago output dir is automatically set to ${absolutePath}`)

  return absolutePath
}
