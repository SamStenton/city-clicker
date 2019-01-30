const path = require('path');
const dist = path.resolve(__dirname, '../dist');

module.exports = {
  entry: path.resolve(__dirname, '../src') + '/index.js',
  mode: 'development',
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
          test: /\.css$/,
          use: [
            'style-loader',
            'css-loader'
          ]
        }
      ]
    }
};