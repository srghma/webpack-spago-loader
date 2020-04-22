// https://github.com/Chance722/webpack-chokidar-plugin/blob/master/src/index.js
// https://github.com/knight9999/pulp-webpack-plugin/blob/master/index.js

// TODO: watch using chokidar, throw errors using webpack
// https://github.com/webpack-contrib/eslint-webpack-plugin/blob/master/src/linter.js#L40-L50

const path = require('path')
const childProcess = require('child_process')
const childProcessPromise = require('child-process-promise')
const chokidar = require('chokidar')
const dargs = require('dargs')
const validateOptions = require('schema-utils')
const debouncePromise = require('debounce-promise')
// const throttlePromise = require('throttle-promise')

// https://github.com/purescript/purescript-lazy/blob/5bbd04f507a704f39aa756b5e12ed6665205fe2e/src/Data/Lazy.js#L3
const defer = function (thunk) {
  let v = null;
  return function() {
    if (thunk === undefined) return v;

    v = thunk();
    thunk = undefined; // eslint-disable-line no-param-reassign
    return v;
  };
};

// async?
const getSourcesFromSpago = () => {
  const spagoSources = childProcess.execSync('spago sources')

  // e.g. [ 'src/**/*.purs', 'test/**/*.purs', 'docs-src/**/*.purs', '.spago/xxxx/*.purs', ..... ]
  const spagoSourcesArray = spagoSources.toString().split('\n').map(x => x.trim()).filter(x => !!x)

  // // e.g. [ 'src/**/*.purs', 'test/**/*.purs', 'docs-src/**/*.purs' ]
  // const spagoSourcesArrayWithoutDotSpagoDirsPurs = spagoSourcesArray.filter(x => !x.startsWith('.spago'))

  // // yes, remove then add again, but more global
  // const spagoSourcesArrayWithSpagoPurs = spagoSourcesArrayWithoutDotSpagoDirsPurs.concat(['.spago/**/*.purs'])

  return spagoSourcesArray
}

// async?
const getOutputDirFromSpago = () => {
  const spagoOutput = childProcess.execSync('spago path output')

  // e.g. 'output'
  const output_ = spagoOutput.toString().trim()

  return output_
}

const spagoPursSourcesToPursAndJs = (spagoPursSources) => {
  const spagoSourcesArrayWithSpagoJs = spagoPursSources.map(x => x.replace(/.purs$/, '.js'))

  const pursAndJs = spagoPursSources.concat(spagoSourcesArrayWithSpagoJs)

  return pursAndJs
}


const buildFn = ({ compiler, compilerArgsArray }) => () => {
  return childProcessPromise
    .spawn(compiler, compilerArgsArray, { stdio: ['ignore', 'inherit', 'inherit'] })
    .then(function () {
      console.log('[spago build] done!');
    })
    .catch(function (err) {
      return new Error('[spago build] failed')
    })
}

const watchAndBuildFn = ({ compiler, compilerArgsArray, filesToWatch }) => () => {
  const watcher = chokidar.watch(filesToWatch)

  runningPromise = null
  const run = () => {
    // console.log('run2', !!runningPromise)

    if (runningPromise) { return runningPromise }

    // console.log('compilerArgsArray', compilerArgsArray)

    runningPromise = childProcessPromise
      .spawn(compiler, compilerArgsArray, { stdio: ['ignore', 'inherit', 'inherit'] })
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

// schema for options object
const schema = {
  type: 'object',
  properties: {
    // e.g. psa or purs
    compiler: {
      type: 'string',
    },
    // e.g. { censorCodes: 'ShadowedName,ImplicitImport,MissingTypeDeclaration', strict: true }
    compilerOptions: {
      type: 'object',
    },
    // e.g. output
    output: {
      type: 'string',
    },
    // e.g. [] or ['src/**/*.purs']
    src: {
      type: 'array',
      items: { type: 'string' },
    },
  }
};

function mkSpagoPlugin(options = {}) {
  const pluginName = 'SpagoPlugin'

  validateOptions(schema, options, pluginName)

  const hookOptions = { name: pluginName };

  const output = options.output ? options.output : getOutputDirFromSpago()
  const src = (options.src && options.src.length !== 0) ? options.src : getSourcesFromSpago()
  const compiler = options.compiler ? options.compiler : 'psa'
  const compilerOptions = options.compilerOptions ? options.compilerOptions : {}

  const isPsa = compiler.endsWith('psa')
  const isPurs = compiler.endsWith('purs')

  let compilerArgsWithoutSrc = null
  if (isPurs) {
    // purs compile --output output <files.purs>

    const compilerArgsArrayDargs = dargs(
      Object.assign(
        {
          output: output,
        },
        compilerOptions
      ),
      { ignoreFalse: true }
    )

    compilerArgsWithoutSrc = [].concat(['compile'], compilerArgsArrayDargs)
  } else if (isPsa) {
    // psa --filter-codes=CODES --output output <files.purs>

    const compilerArgsArrayDargs = dargs(
      Object.assign(
        {
          output: output,
        },
        compilerOptions
      ),
      { ignoreFalse: true }
    )

    compilerArgsWithoutSrc = compilerArgsArrayDargs
  } else {
    throw new Error(`[${pluginName}] unknown compiler, should be psa or purs ${compiler}`)
  }

  console.log(`[${pluginName}] using command for compilation: ${compiler} ${compilerArgsWithoutSrc.join(' ')} <files.purs>`)

  const compilerArgsArray = [].concat(compilerArgsWithoutSrc, src)

  // console.log(`[${pluginName}] using command for compilation: ${compiler} ${compilerArgsArray.join(' ')}`)

  const spagoSourcesToWatch = spagoPursSourcesToPursAndJs(src)

  // console.log('spagoSourcesToWatch', spagoSourcesToWatch)

  const buildFnOnce         = defer(buildFn({ compiler: compiler, compilerArgsArray: compilerArgsArray }))
  const watchAndBuildFnOnce = defer(watchAndBuildFn({ compiler: compiler, compilerArgsArray: compilerArgsArray, filesToWatch: spagoSourcesToWatch }))

  class SpagoPlugin {
    apply(compiler) {
      compiler.hooks.run.tapPromise(hookOptions, (compilation) => {
        return buildFnOnce()
      })

      compiler.hooks.watchRun.tapPromise(hookOptions, (compilation) => {
        watchAndBuildFnOnce()

        return Promise.resolve()
      })
    }
  }

  return SpagoPlugin
}

module.exports = mkSpagoPlugin
