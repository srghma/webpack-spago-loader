// https://github.com/Chance722/webpack-chokidar-plugin/blob/master/src/index.js
// https://github.com/knight9999/pulp-webpack-plugin/blob/master/index.js

// TODO: watch using chokidar, throw errors using webpack
// https://github.com/webpack-contrib/eslint-webpack-plugin/blob/master/src/linter.js#L40-L50

const path = require('path')
const chokidar = require('chokidar')
const debouncePromise = require('debounce-promise')
// const throttlePromise = require('throttle-promise')

const buildFn = require('./internal/buildFn')
const parseOptions = require('./internal/parseOptions')
const { defer } = require('./internal/lib')

const watchAndBuildFn = ({ compiler, compilerArgsArray, filesToWatch }) => () => {
  const watcher = chokidar.watch(filesToWatch)

  runningPromise = null
  const run = () => {
    // console.log('run2', !!runningPromise)

    if (runningPromise) { return runningPromise }

    // console.log('compilerArgsArray', compilerArgsArray)

    runningPromise = buildFn.spawn({ compiler, compilerArgsArray })
      .then(function () {
        runningPromise = null

        console.log('[spago build] done!');
      })
      .catch(function (err) {
        runningPromise = null

        return new Error('[spago build] failed')
      })

    return runningPromise
  }

  const run_ = debouncePromise(run, 300)
  // const run__ = throttlePromise(
  //   run,
  //   1,
  //   100
  // )

  watcher.on('all', (_event, _path) => {
    // console.log('run', _path)
    run_()
  })

  return true
}

function mkSpagoPlugin(options = {}) {
  const pluginName = 'SpagoPlugin'

  // console.log(`[${pluginName}] using command for compilation: ${compiler} ${compilerArgsArray.join(' ')}`)

  const { compiler, compilerArgsArray, filesToCompile } = parseOptions(options)

  // console.log('spagoSourcesToWatch', spagoSourcesToWatch)

  const buildFnOnce         = defer(buildFn.buildFn({ compiler: compiler, compilerArgsArray: compilerArgsArray }))
  const watchAndBuildFnOnce = defer(watchAndBuildFn({ compiler: compiler, compilerArgsArray: compilerArgsArray, filesToWatch: filesToCompile }))

  class SpagoPlugin {
    apply(compiler) {
      const hookOptions = { name: pluginName };

      compiler.hooks.run.tapPromise(hookOptions, (compilation) => {
        return buildFnOnce()
      })

      let firstBuild = true
      compiler.hooks.watchRun.tapPromise(hookOptions, async (compilation) => {
        if (firstBuild) {
          firstBuild = false

          await buildFnOnce()

          watchAndBuildFnOnce()
        }

        return
      })
    }
  }

  return SpagoPlugin
}

module.exports = mkSpagoPlugin
