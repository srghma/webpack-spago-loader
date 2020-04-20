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
    new (require('webpack-spago-loader/plugin'))(),
  ]
};
```

2. run `spago build --watch` in one terminal (or `require('child_process').spawn('spago', ['build', '--watch'])`)

3. run webpack
