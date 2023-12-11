// production config
const { merge } = require("webpack-merge");
const { resolve } = require("path");

const commonConfig = require("./webpack.common");

module.exports = merge(commonConfig, {
  mode: "production",
  output: {
    path: resolve(__dirname, 'dist'),
    filename: 'index.js',
    library: {
      type: "module",
    },
    umdNamedDefine: true
  },
  optimization: {
    minimize: false
  },
  experiments: {
    outputModule: true
  },
  externals: {
    react: "react",
    "react-dom": "react-dom",
  },
});
