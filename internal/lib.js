const childProcess = require('child_process')
const path = require('path')

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

// async?
const getAbsoluteOutputDirFromSpago = () => {
  const dir = getOutputDirFromSpago()

  const absolutePath = path.resolve(dir)

  return absolutePath
}

const spagoPursSourcesToPursAndJs = (spagoPursSources) => {
  const spagoSourcesArrayWithSpagoJs = spagoPursSources.map(x => x.replace(/.purs$/, '.js'))

  const pursAndJs = spagoPursSources.concat(spagoSourcesArrayWithSpagoJs)

  return pursAndJs
}

module.exports.defer = defer
module.exports.getSourcesFromSpago = getSourcesFromSpago
module.exports.getOutputDirFromSpago = getOutputDirFromSpago
module.exports.getAbsoluteOutputDirFromSpago = getAbsoluteOutputDirFromSpago
module.exports.spagoPursSourcesToPursAndJs = spagoPursSourcesToPursAndJs
