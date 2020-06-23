const childProcessPromise = require('child-process-promise')

const spawn = ({ compiler, compilerArgs, pursFiles }) => childProcessPromise.spawn(compiler, compilerArgs.concat(pursFiles), { stdio: ['ignore', 'inherit', 'inherit'] })

module.exports = spawn
