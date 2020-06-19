const fs = require('fs')
const path = require('path')
const loaderUtils = require('loader-utils')
const validateOptions = require('schema-utils')
const jsStringEscape = require('js-string-escape')

// TLDR: this loader converts `.spago/.../xxx.js` foreign paths back to original based on `externs.json` or `externs.cbor`
//
// e.g. in file /home/srghma/projects/purescript-webpack-example/output/Example.Body
//
// replaces
//
// ```
// var $foreign = require("./foreign.js");
// var Example_Body_Title = require("../Example.Body.Title/index.js");
// ```
//
// with
//
// ```
// var $foreign = require("project_dir/origdir/foreign.js");
// var Example_Body_Title = require("../Example.Body.Title/index.js");
// ```
//
// because "./foreign.js" may contain `./logo.pdf`, but `./` is in `project_dir/output`
// we have to convert "./foreign.js" to "project_dir/origdir/foreign.js" so that logo path is resolved correctly

module.exports = async function spagoLoader(source) {
  const this_ = this

  this_.cacheable && this_.cacheable()

  // console.log('this_', this_)

  // console.log('')
  // console.log('this_.resourcePath', this_.resourcePath)
  const foreignRE = /require\(['"]\.\/foreign(?:\.js)?['"]\)/g;

  const source_ = source.replace(foreignRE, (match) => {
    const externsJsonPath = this_.resourcePath.replace(/index.js$/, 'externs.json')
    const externsCborPath = this_.resourcePath.replace(/index.js$/, 'externs.cbor')

    // TODO: load asyncly
    // e.g. can return
    //
    // src/MyModule.purs
    // .spago/affjax/v10.0.0/src/Affjax/StatusCode.purs
    // /FULLPATH/.spago/affjax/v10.0.0/src/Affjax/StatusCode.purs
    let originalPursPath = null

    if (fs.existsSync(externsJsonPath)) {
      const externs = require(externsJsonPath)
      originalPursPath = externs.efSourceSpan.name
    } else if (fs.existsSync(externsCborPath)) {
      const externs = require('cbor-sync').decode(fs.readFileSync(externsCborPath))

      originalPursPath = externs[externs.length - 1][1] // TODO: may be broken very easily
    } else {
      throw new Error(`Neither ${externsJsonPath} nor ${externsCborPath} exists`)
    }

    // console.log('source', source)
    // console.log('match', match)
    // console.log('originalPursPath', originalPursPath)

    const isNonAppFile = originalPursPath.includes('.spago/')

    if (isNonAppFile) {
      // do nothing

      return match
    }

    // else change path of foreign import back to original

    const relativeOriginalFFiPath = originalPursPath.replace(/.purs$/, '.js')

    const rootContext = this_.rootContext

    // console.log('rootContext', rootContext)

    const absoluteOriginalFFiPath = path.join(rootContext, relativeOriginalFFiPath)

    // console.log('absoluteOriginalFFiPath', absoluteOriginalFFiPath)

    this_.addDependency(absoluteOriginalFFiPath)

    return `require("${jsStringEscape(absoluteOriginalFFiPath)}")`
  })

  // console.log('source_', source_)

  return source_
}
