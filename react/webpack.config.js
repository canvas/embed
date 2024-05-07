const path = require('path');
const base = require('./webpack.base.js');
const { merge } = require('webpack-merge');

module.exports = merge(base, {
    externals: {
        react: 'React',
        'react-dom': 'ReactDom',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        libraryTarget: 'umd',
        library: 'canvas-embed',
    },
});
