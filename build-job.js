const path = require('path')

const spawn = require('./internal/spawn')
const parseOptions = require('./internal/parseOptions')

function buildJob(options = {}) {
  const { compiler, compilerArgs, pursFiles } = parseOptions(options)

  return spawn({ compiler, compilerArgs, pursFiles })
    .then(function () {
      console.log('[webpack-spago-loader] done!');
    })
    .catch(function (err) {
      console.log('[webpack-spago-loader] failed')
      throw err
    })
}

module.exports = buildJob
