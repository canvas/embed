const path = require('path');
const base = require('./webpack.base.js');
const { merge } = require('webpack-merge');

// If you have React and ReactDOM you can use the renderToTag function in WebIndex.tsx to render the component
module.exports = merge(base, {
    entry: './src/WebIndex.tsx',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'embed.web.js',
        libraryTarget: 'umd',
        library: 'canvas-embed',
    },
});
