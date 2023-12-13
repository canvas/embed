const path = require("path");

module.exports = {
  entry: "./src/index.tsx", // The entry file for your component
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
    libraryTarget: "umd",
    library: "canvas-embed", // Your component's name
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".jsx"],
  },
  externals: {
    react: "react", // Treat React as an external dependency
    "react-dom": "react-dom", // Treat ReactDOM as an external dependency
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.(tsx?)$/,
        exclude: /node_modules/,
        use: ["ts-loader"],
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
      {
        test: /\.less$/, // Use the less-loader for .less files
        use: [
          "style-loader", // Inject styles into the DOM
          "css-loader", // Transpile CSS to CommonJS
          {
            loader: "less-loader",
            options: {
              lessOptions: {
                javascriptEnabled: true,
                relativeUrls: false,
                modifyVars: {
                  "@body-background": "#E5E5E5",
                  "@layout-header-height": "50px",
                  "@layout-body-background": "#E5E5E5",
                  "@layout-header-background": "#2A316B",
                  "@layout-sider-background": "#FFFFFF",
                  "@primary-color": "#2A316B", // primary color for all components
                  "@link-color": "#1060fd",
                  "@table-header-bg": "#FFFFFF",
                  "@select-border-color": "#d9e2ec",
                  "@input-border-color": "#d9e2ec",
                },
              },
            },
          },
        ],
      },
      {
        test: /\.svg$/,
        use: ["@svgr/webpack"],
      },
    ],
  },
};
