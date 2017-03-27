var fs = require('fs');
var path = require('path');
var webpack = require('webpack');

var alias = {};
(function() {
  var links = {};
  var webmodulesrcfile = path.join(__dirname, '.webmodulesrc');
  if( fs.existsSync(webmodulesrcfile) ) {
    links = JSON.parse(fs.readFileSync(webmodulesrcfile)).links || {};
  }
  
  Object.keys(links).forEach(function(key) {
    alias[key] = links[key];
  });
  
  alias['ff-editor'] = __dirname;
})();

module.exports = {
  entry: {
    article: path.join(__dirname, 'docs/src/article.js')
  },
  output: {
    path: path.join(__dirname, 'docs/js'),
    filename: '[name].js',
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      }, {
        test: /\.less$/,
        loader: 'style-loader!css-loader!less-loader'
      }, {
        test: /\.(jpg|png|woff|woff2|gif|eot|ttf|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url-loader'
      }, {
        test: /\.html$/,
        loader: 'html-loader'
      }, {
        test: /\.es6.js$/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      }
    ]
  },
  resolve: {
    alias: alias
  },
  devtool: 'source-map'
};
