const config = require('./config')
const path = require('path')
const webpack = require('webpack')

module.exports = {
  mode: config.envProduction ? 'production' : 'development',
  entry: [path.join(__dirname, `${config.tasks.webpack.src}`)],
  output: {
    path: path.join(__dirname, config.tasks.webpack.dest),
    filename: config.tasks.webpack.filename
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modeles/,
        loader: 'babel-loader'
      },
      {
        test: /\.(vert|frag|glsl)$/,
        use: {
          loader: 'webpack-glsl-loader'
        }
      }
    ]
  }
}
