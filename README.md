# webpack-spago-loader

Resolves https://github.com/ethul/purs-loader/issues/144

How to use:

1. Add minimal `webpack.config.js`

```js
const path = require('path');
const webpack = require('webpack');

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
      // import `src/MyFile.purs`, return `output/MyFile/index.js`
      {
        test: /\.purs$/,
        use: [
          {
            loader: 'webpack-spago-loader/purs-loader',
            options: {
              spagoAbsoluteOutputDir: path.resolve(__dirname, 'output'),
            }
          }
        ]
      },
      // change `var $foreign = require("./foreign.js");` to `var $foreign = require("src/MyFile/index.js");`
      {
        test: /\.js$/,
        include: [path.resolve(__dirname, 'output')], // process only files from `spago output`
        use: [
          {
            loader: 'webpack-spago-loader/foreign-spago-js-loader',
          }
        ]
      },
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
};
```

2. run `spago build --watch` in one terminal (or `require('child_process').spawn('spago', ['build', '--watch'])`)

3. run webpack
