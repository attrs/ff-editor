var path = require('path');
var webpack = require('webpack');

var loaders = [
  {
    test: /\.css$/,
    loader: 'style!css'
  }, {
    test: /\.less$/,
    loader: 'style!css!less'
  }, {
    test: /\.(jpg|png|woff|woff2|eot|ttf|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
    loader: 'url'
  }, {
    test: /\.html$/,
    loader: 'html'
  }, {
    test: /\.es6.js$/,
    loader: 'babel',
    query: {
      presets: ['es2015']
    }
  }
];

module.exports = [
  {
    entry: path.join(__dirname, 'lib/index.js'),
    output: {
      path: path.join(__dirname, 'dist'),
      filename: 'ff.js',
      library: 'FF',
      libraryTarget: 'umd',
      umdNamedDefine: true
    },
    module: {
      loaders: loaders
    },
    devtool: 'source-map'
  }, {
    entry: path.join(__dirname, 'docs/src/app.js'),
    output: {
      path: path.join(__dirname, 'docs/js'),
      filename: 'app.js',
    },
    module: {
      loaders: loaders
    },
    resolve: {
      root: __dirname,
      alias: {
        'firefront': __dirname
      },
      extensions: ['', '.js', '.css']
    },
    devtool: 'source-map'
  }
];
