// development config
const { merge } = require('webpack-merge')
const commonConfig = require('./webpack.common')

module.exports = merge(commonConfig, {
  mode: 'development',
  devServer: {
    hot: true, // enable HMR on the server
    historyApiFallback: true, // fixes error 404-ish errors when using react router :see this SO question: https://stackoverflow.com/questions/43209666/react-router-v4-cannot-get-url
  },
  devtool: 'cheap-module-source-map',
  output: {
    path: resolve(__dirname, 'dist'),
    filename: 'index.js',
    library: {
      type: 'module',
    },
    umdNamedDefine: true,
  },
  externals: {
    react: 'react',
    'react-dom': 'react-dom',
  },
})
