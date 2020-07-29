// https://github.com/Chance722/webpack-chokidar-plugin/blob/master/src/index.js
// https://github.com/knight9999/pulp-webpack-plugin/blob/master/index.js

// TODO: watch using chokidar, throw errors using webpack
// https://github.com/webpack-contrib/eslint-webpack-plugin/blob/master/src/linter.js#L40-L50

const path = require('path')
const chokidar = require('chokidar')
const debouncePromise = require('debounce-promise')

const spawn = require('./internal/spawn')
const parseOptions = require('./internal/parseOptions')

const runBuildFn = ({
  compiler,
  compilerArgs,
  pursFiles,
  onStart,
  onError,
  onSuccess,
}) => {
  runningPromise = null

  const run = () => {
    onStart()

    if (runningPromise) { return }

    runningPromise = spawn({ compiler, compilerArgs, pursFiles })
      .then(function () {
        runningPromise = null

        onSuccess()
      })
      .catch(function (err) {
        runningPromise = null

        onError()
      })
  }

  return debouncePromise(run, 300)
}

module.exports = function runWatcher({ options = {}, onStart, onError, onSuccess, additionalWatchGlobs: [] }) {
  const { compiler, compilerArgs, pursFiles, pursAndJsFiles } = parseOptions(options)

  console.log(`[webpack-spago-loader] using command for compilation: ${compiler} ${compilerArgs.concat(['<files.purs>']).join(' ')}`)

  const watcher = chokidar.watch(additionalWatchGlobs.concat(pursAndJsFiles))

  const runBuild = runBuildFn({
    compiler,
    compilerArgs,
    pursFiles,
    onStart,
    onError,
    onSuccess,
  })

  watcher.on('all', (_event, _path) => {
    runBuild()
  })
}
