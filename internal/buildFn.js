const childProcessPromise = require('child-process-promise')

const spawn = ({ compiler, compilerArgsArray }) => childProcessPromise.spawn(compiler, compilerArgsArray, { stdio: ['ignore', 'inherit', 'inherit'] })

const buildFn = (options) => () => {
  return spawn(options)
    .then(function () {
      console.log('[spago build] done!');
    })
    .catch(function (err) {
      return new Error('[spago build] failed')
    })
}

module.exports.spawn = spawn
module.exports.buildFn = buildFn
