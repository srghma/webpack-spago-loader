# webpack-spago-loader

Resolves https://github.com/ethul/purs-loader/issues/144

How to use:

1. Add minimal `webpack.config.js`

```js
const path = require('path');
const webpack = require('webpack');

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
      ...(require('webpack-spago-loader/rules')()),

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

3. run webpack
