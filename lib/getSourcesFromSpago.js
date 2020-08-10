// async?
module.exports = function getSourcesFromSpago(config) {
  const spagoSources = require('child_process').execSync('spago --config ' + config + ' sources')

  // e.g. [ 'src/**/*.purs', 'test/**/*.purs', 'docs-src/**/*.purs', '.spago/xxxx/*.purs', ..... ]
  const spagoSourcesArray = spagoSources.toString().split('\n').map(x => x.trim()).filter(x => !!x)

  // // e.g. [ 'src/**/*.purs', 'test/**/*.purs', 'docs-src/**/*.purs' ]
  // const spagoSourcesArrayWithoutDotSpagoDirsPurs = spagoSourcesArray.filter(x => !x.startsWith('.spago'))

  // // yes, remove then add again, but more global
  // const spagoSourcesArrayWithSpagoPurs = spagoSourcesArrayWithoutDotSpagoDirsPurs.concat(['.spago/**/*.purs'])

  return spagoSourcesArray
}
