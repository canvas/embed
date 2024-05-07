const path = require('path');
const base = require('./webpack.base.js');
const { merge } = require('webpack-merge');

module.exports = merge(base, {
    externals: {
        react: 'react', // Treat React as an external dependency
        'react-dom': 'react-dom', // Treat ReactDOM as an external dependency
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        libraryTarget: 'umd',
        library: 'canvas-embed', // Your component's name
    },
});
