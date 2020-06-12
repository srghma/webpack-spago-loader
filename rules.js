const { getAbsoluteOutputDirFromSpago } = require('./internal/lib')
const path = require('path')

module.exports = function createRules(options = {}) {
  const spagoAbsoluteOutputDir_ = options.spagoAbsoluteOutputDir ? options.spagoAbsoluteOutputDir : getAbsoluteOutputDirFromSpago() // XXX: should be absolute OR webpack will throw warning

  return [
    // your import `src/MyFile.purs`, it returns `output/MyFile/index.js`
    {
      test: /\.purs$/,
      use: [
        {
          loader: path.resolve(__dirname, 'loaders', 'purs'),
          options: {
            spagoAbsoluteOutputDir: spagoAbsoluteOutputDir_,
          }
        }
      ]
    },
    // change `var $foreign = require("./foreign.js");` to `var $foreign = require("src/MyFile/index.js");`
    //
    // for example you need when you import static files inside of foreign module
    // like this `modules.exports = require('./logo.png')`
    {
      test: /\.js$/,
      include: [spagoAbsoluteOutputDir_], // process only files from `spago output`
      use: [
        {
          loader: path.resolve(__dirname, 'loader', 'spago-foreign-js'),
        }
      ]
    },
  ]
}
