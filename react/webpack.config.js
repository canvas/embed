const path = require('path');
const base = require('./webpack.base.js');
const { merge } = require('webpack-merge');

module.exports = merge(base, {
    externals: {
        react: 'react',
        'react-dom': 'react-dom',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        libraryTarget: 'umd',
        library: 'canvas-embed',
        clean: true,
    },
    mode: 'production',
});
