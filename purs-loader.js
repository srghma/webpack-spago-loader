const fs = require('fs')
const path = require('path')
const jsStringEscape = require('js-string-escape')
const loaderUtils = require('loader-utils')
const validateOptions = require('schema-utils')

const schema = {
  "additionalProperties": false,
  "properties": {
    "spagoAbsoluteOutputDir": {
      "type": "string"
    },
  },
  "type": "object"
}

function matchModule(str) {
  const srcModuleRegex = /(?:^|\n)module\s+([\w\.]+)/i

  const matches = str.match(srcModuleRegex)

  return matches && matches[1]
}

// TLDR: converts `.purs` paths to `.spago/.../xxx.js` paths

module.exports = async function spagoLoader(source) {
  const this_ = this

  this_.cacheable && this_.cacheable()

  const callback = this_.async();

  const options = loaderUtils.getOptions(this_);

  validateOptions(schema, options, {
    name: 'Spago Loader',
    baseDataPath: 'options',
  })

  // console.log('')
  // console.log('spagoAbsoluteOutputDir', spagoAbsoluteOutputDir)
  // console.log('this_', this_)

  const psModuleName = matchModule(source)

  // console.log('psModuleName', psModuleName)

  const psModuleJsPath = path.join(options.spagoAbsoluteOutputDir, psModuleName, 'index.js')

  // console.log('psModuleJsPath', psModuleJsPath)

  fs.readFile(psModuleJsPath, 'utf-8', function(error, psModuleJsSource) {
    if (error) return callback(error)

    // console.log('psModuleJsSource', psModuleJsSource)

    // Clear
    // if (this_.getDependencies().length !== 1) throw new Error('there are some other dependencies except purs file, cannot clear it: ', this_.getDependencies())
    // console.log('getDependencies', this_.getDependencies()) // e.g. '/fullpath/Client.purs'
    // console.log('getContextDependencies', this_.getContextDependencies())
    // console.log('this_.resourcePath', this_.resourcePath)
    // console.log('source', source)

    // this_.clearDependencies() // dont watch original purs file, doesnt work
    this_.addDependency(psModuleJsPath) // watch js file instead
    // this_.addContextDependency(options.spagoAbsoluteOutputDir)

    const requireRE = /require\(['"]\.\.\/([\w\.]+)(?:\/index\.js)?['"]\)/g;
    const foreignRE = /require\(['"]\.\/foreign(?:\.js)?['"]\)/g;

    const psModuleJsSource_ =
      psModuleJsSource
      .replace(requireRE, (_match, moduleName) => {
        const absolutePsCompiledDepPath = path.join(options.spagoAbsoluteOutputDir, moduleName, 'index.js')
        return `require("${jsStringEscape(absolutePsCompiledDepPath)}")`
      })
      .replace(foreignRE, () => {
        const foreignImportPath = this_.resourcePath.replace(/.purs$/, '.js')

        // console.log('foreignImportPath', foreignImportPath)

        return `require("${jsStringEscape(foreignImportPath)}")`;
      })

    // console.log('psModuleJsSource_', psModuleJsSource_)

    callback(null, psModuleJsSource_)
  });
}
