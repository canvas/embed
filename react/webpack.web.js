const path = require('path');
const base = require('./webpack.base.js');
const { merge } = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');

// If you use the unpkg CDN to install React then they end up in the React and ReactDOM namespaces
// as oppsoed to react and react-dom as they would if you installed them via npm. So we make a separate
// build that expects the externals at the CDN locations for use there. Insanity.
module.exports = merge(base, {
    externals: {
        react: 'React',
        'react-dom': 'ReactDOM',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'embed.js',
        libraryTarget: 'umd',
        library: 'canvas-embed',
        clean: true,
    },
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin()],
    },
    mode: 'production',
});
