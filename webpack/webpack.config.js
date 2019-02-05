const path = require('path');
const dist = path.resolve(__dirname, '../dist');
const CopyWebpackPlugin = require('copy-webpack-plugin')


module.exports = {
  entry: path.resolve(__dirname, '../src') + '/index.js',
  mode: 'development',
  plugins: [
    new CopyWebpackPlugin([{ from: path.resolve(__dirname, '../src/index.html'), to: dist }])
  ],
  devServer: {
    contentBase: dist
  }, 
  output: {
    filename: 'main.js',
    path: dist
  },
    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        },
        {
          test: /\.css$/,
          use: [
            'style-loader',
            'css-loader'
          ]
        }
      ]
    }
};