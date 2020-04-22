# webpack-spago-loader

Resolves https://github.com/ethul/purs-loader/issues/144

How to use:

1. Add minimal `webpack.config.js`

```js
const path = require('path');
const webpack = require('webpack');

// create loader plugin outside of webpack configuration
// to allow multiple webpack instances to use the same chokidar watcher
//
// all options are passed here
const spagoLoader = require('webpack-spago-loader/plugin')({
  // compiler: 'purs' // or 'psa' (default)
  // note that warnings are shown only when file is recompiled, delete output folder to show all warnigns
  compilerOptions: {
    censorCodes: [ // ignore these warnings
      'ImplicitQualifiedImport',
      'UnusedImport',
      'ImplicitImport',
    ].join(','),
    strict: true // treat warnings as errors
  }
})

module.exports = {
  devtool: 'eval-source-map',

  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
    port: 4008,
    stats: 'errors-only'
  },

  entry: './src/entrypoint.js',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },

  module: {
    rules: [
      // adds two rules for .purs files and .js files inside .spago dir
      // check source code to see what they do
      ...(require('webpack-spago-loader/rules')()),

      // works with images files
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

  plugins: [
    new spagoLoader(),
  ]
};
```

3. run webpack
