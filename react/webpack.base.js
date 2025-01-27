const path = require('path');
const webpack = require('webpack');

module.exports = {
    mode: process.env.NODE_ENV || 'production',
    entry: './src/index.tsx', // The entry file for your component
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.jsx'],
        alias: {
            root: __dirname,
            src: path.resolve(__dirname, 'src'),
        },
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.REACT_APP_VERSION': JSON.stringify(process.env.npm_package_version),
        }),
    ],
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
            {
                test: /\.(tsx?)$/,
                exclude: /node_modules/,
                use: ['ts-loader'],
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader', 'postcss-loader'],
            },
            {
                test: /\.less$/, // Use the less-loader for .less files
                use: [
                    'style-loader', // Inject styles into the DOM
                    'css-loader', // Transpile CSS to CommonJS
                    {
                        loader: 'less-loader',
                        options: {
                            lessOptions: {
                                javascriptEnabled: true,
                                relativeUrls: false,
                            },
                        },
                    },
                ],
            },
            {
                test: /\.svg$/,
                use: ['@svgr/webpack'],
            },
        ],
    },
};
