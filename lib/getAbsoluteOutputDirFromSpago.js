// async?
module.exports = function getAbsoluteOutputDirFromSpago(config) {
  // e.g. `output`
  const dir = require('child_process').execSync('spago --config ' + config + ' path output').toString().trim()

  const absolutePath = require('path').resolve(dir)

  return absolutePath
}
