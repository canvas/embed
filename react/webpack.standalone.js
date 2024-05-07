const path = require('path');
const base = require('./webpack.base.js');
const { merge } = require('webpack-merge');

module.exports = merge(base, {
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle_with_react.js',
        libraryTarget: 'umd',
        library: 'canvas-embed',
    },
});
