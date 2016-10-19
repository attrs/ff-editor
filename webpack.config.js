var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: path.join(__dirname, 'lib/index.js'),
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'firefront.js',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  devtool: 'source-map'
};
