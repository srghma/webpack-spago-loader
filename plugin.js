// https://github.com/Chance722/webpack-chokidar-plugin/blob/master/src/index.js
// https://github.com/knight9999/pulp-webpack-plugin/blob/master/index.js

const path = require('path')
const childProcess = require('child-process-promise')

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


const buildOnlyOnce = defer(() => {
  return childProcess
    .spawn("spago", ["build"], { stdio: ['ignore', 'inherit', 'inherit'] })
    .then(function () {
      console.log('[spago build] done!');
    })
    .catch(function (err) {
      return new Error('[spago build] failed')
      // console.error('[spawn] ERROR: ', err);
    })

  // const singletonCompilerProcess = singletonCompilerPromise.childProcess;

  // console.log('[spawn] singletonCompilerProcess.pid: ', singletonCompilerProcess.pid)

  // singletonCompilerProcess.stdout.on('data', function (data) {
  //   process.stdout.write(data)
  //   // console.log('[spawn] stdout: ', data.toString());
  // });

  // singletonCompilerProcess.stderr.on('data', function (data) {
  //   process.stderr.write(data)
  //   // console.log('[spawn] stderr: ', data.toString());
  // });
})

const runSingletonCompiler = defer(() => {
  return childProcess.spawn("spago", ["build", "--watch"], { stdio: ['pipe', 'inherit', 'inherit'] })
})

class PurescriptPlugin {
  constructor(options = {}) {
    this.options = {}
    // this.options = getOptions(options);
  }

  apply(compiler) {
    const options = { ...this.options };

    const plugin = { name: this.constructor.name };

    compiler.hooks.run.tapPromise(plugin, (compilation) => {
      return buildOnlyOnce()
    })

    /* istanbul ignore next */
    compiler.hooks.watchRun.tapPromise(plugin, (compilation) => {
      runSingletonCompiler()
      return Promise.resolve()
    })
  }
}

module.exports = PurescriptPlugin
