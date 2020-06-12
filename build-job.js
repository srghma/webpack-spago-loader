const path = require('path')

const buildFn = require('./internal/buildFn')
const parseOptions = require('./internal/parseOptions')

function buildJob(options = {}) {
  const { compiler, compilerArgsArray } = parseOptions(options)

  return buildFn.buildFn({ compiler: compiler, compilerArgsArray: compilerArgsArray })()
}

module.exports = buildJob
