const autoprefixer = require('autoprefixer');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const config = {
  entry: {
    app: [
      './app/index.js'
    ]
  },
  output: {
    filename: '[name].js',
    path: path.join(__dirname, './dist'),
    chunkFilename: '[id].chunk.js'
  },
  module: {
    loaders: [
      {
        test: /\.(scss|css)$/,
        // loader: ExtractTextPlugin.extract('style-loader', sassLoaders.join('!'))
        loader: ExtractTextPlugin.extract('css!sass')
        // loaders: ["style", "css", "sass"]
      },
      { test: /\.json$/, loader: 'json'},
      { test: /\.html$/, loader: 'text' },
      { test: /.(png|jpg|gif|woff(2)?|eot|ttf|svg)(\?[a-z0-9=\.]+)?$/, loader: 'url-loader?limit=18192' },
      { test: /bootstrap\/dist\/js\/umd\//, loader: 'imports?jQuery=jquery' }
    ]
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: 'app/templates', to: 'templates/'},
      { from: 'app/images', to: 'images/'},
      { from: 'app/config.json'}
    ]),
    new ExtractTextPlugin('[name].css', {allChunks: true}),
    new webpack.ProvidePlugin({
      'window.Tether': 'tether'
    }),
    new webpack.optimize.DedupePlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve('app', 'index.html'),
      inject: 'body'
    })
  ],
  postcss: [
    autoprefixer({
      browsers: ['last 2 versions']
    })
  ]
};

module.exports = config;
