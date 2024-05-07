const path = require('path');

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
                                modifyVars: {
                                    '@body-background': '#E5E5E5',
                                    '@layout-header-height': '50px',
                                    '@layout-body-background': '#E5E5E5',
                                    '@layout-header-background': '#2A316B',
                                    '@layout-sider-background': '#FFFFFF',
                                    '@primary-color': '#2A316B', // primary color for all components
                                    '@link-color': '#1060fd',
                                    '@table-header-bg': '#FFFFFF',
                                    '@select-border-color': '#d9e2ec',
                                    '@input-border-color': '#d9e2ec',
                                },
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
