const path = require('path');
const base = require('./webpack.base.js');
const { merge } = require('webpack-merge');

module.exports = merge(base, {
    entry: './src/WebIndex.tsx',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle_web.js',
        libraryTarget: 'umd',
        library: 'canvas-embed',
    },
});
