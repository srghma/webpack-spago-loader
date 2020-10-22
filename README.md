# webpack-spago-loader

### TLDR

The idea is actually very simple - instead of tracking which `.purs` file was imported with webpack machinery AND having memory cache of compiled files (as ethul/purs-loader does) - just friking change import paths from `./Foo/Bar.purs` to `.../output/Foo.Bar/index.js` AND vice versa for `.../output/Foo.Bar/foreign.js` to `.../orig-file.js`

Resolves https://github.com/ethul/purs-loader/issues/144

### How to use:

1. Add minimal `webpack.config.js`

```js
const path = require('path');
const webpack = require('webpack');

const spagoOptions = {
  compiler:  'psa',
  output:    require('webpack-spago-loader/lib/getAbsoluteOutputDirFromSpago')('./spago.dhall'),
  pursFiles: require('webpack-spago-loader/lib/getSourcesFromSpago')('./spago.dhall'),

  // note that warnings are shown only when file is recompiled, delete output folder to show all warnigns
  compilerOptions: {
    censorCodes: ['ImplicitQualifiedImport', 'UnusedImport', 'ImplicitImport'].join(','),

    // strict: true
  }
}

module.exports = {
  entry: './src/entrypoint.js',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },

  module: {
    rules: [
      // adds two rules for .purs files and .js files inside .spago dir
      // check source code to see what they do
      ...(require('webpack-spago-loader/rules')({ spagoAbsoluteOutputDir: spagoOptions.output })),

      // works with image files
      {
        test: /\.(png|jpg|gif)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
            },
          },
        ],
      },
    ]
  },

  resolve: {
    modules: [ 'node_modules' ],
    extensions: [ '.purs', '.js']
  },
};
```

3. run webpack with build job (or watch job)

```js
await require('webpack-spago-loader/build-job')(spagoOptions)

const compiler = webpack(config)

compiler.run((err, stats) => {...})
```
