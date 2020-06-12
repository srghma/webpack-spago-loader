const childProcessPromise = require('child-process-promise')

const spawn = ({ compiler, compilerArgsArray }) => childProcessPromise.spawn(compiler, compilerArgsArray, { stdio: ['ignore', 'inherit', 'inherit'] })

const buildFn = (options) => () => {
  return spawn(options)
    .then(function () {
      console.log('[webpack-spago-loader] done!');
    })
    .catch(function (err) {
      console.log('[webpack-spago-loader] failed')
      throw err
    })
}

module.exports.spawn = spawn
module.exports.buildFn = buildFn
