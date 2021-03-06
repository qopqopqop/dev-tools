var path = require('path');
var env = require('./utils/environment');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var autoprefixer = require('autoprefixer');
var assets = require('postcss-assets');

module.exports = {
  debug: env.isDevelopment(),
  devtool: env.isProduction() ? false : 'eval-source-map', //more info:https://webpack.github.io/docs/build-performance.html#sourcemaps and https://webpack.github.io/docs/configuration.html#devtool
  entry: path.resolve('js', 'main.js'),
  output: {
    path: path.resolve('public', 'build'),
    publicPath: '/build/',
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: require.resolve('babel-loader'),
        query: {
          presets: [
            require.resolve('babel-preset-react'),
            require.resolve('babel-preset-es2015'),
          ]
        }
      },
      {
        test: /(\.css|\.scss)$/,
        include: path.resolve('sass'),
        loader: ExtractTextPlugin.extract(
          require.resolve('style-loader'), [
            require.resolve('raw-loader'),
            require.resolve('postcss-loader'),
            require.resolve('sass-loader'),
          ].join('!'))
      }
    ]
  },
  postcss: function () {
    return [
      autoprefixer,
      assets({
        loadPaths: ['images/'],
        basePath: 'public/'
      })
    ];
  },
  plugins: getPlugins()
};

function getPlugins () {

  var GLOBALS = {
    'process.env.NODE_ENV': JSON.stringify(env.getEnvironment()),
    __DEV__: env.isDevelopment()
  };

  var plugins = [
    new ExtractTextPlugin('screen.css'),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.DefinePlugin(GLOBALS) //Tells React to build in prod mode. https://facebook.github.io/react/downloads.html
  ];

  switch(env.getEnvironment()) {
    case 'production':
      plugins.push(new webpack.optimize.DedupePlugin());
      plugins.push(new webpack.optimize.UglifyJsPlugin({
        minimize: true,
        sourceMap: false
      }));
      break;
    case 'development':
      plugins.push(new webpack.NoErrorsPlugin());
      break;
  }

  return plugins;
}
