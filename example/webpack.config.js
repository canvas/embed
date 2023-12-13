const path = require("path");
const Dotenv = require("dotenv-webpack");

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],

    // https://github.com/facebook/react/issues/13991#issuecomment-435587809
    alias: {
      react: path.resolve("./node_modules/react"),
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.(ts|tsx)$/,
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
    ],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "public"),
    },
    port: 3005,
    open: true,
  },
  plugins: [new Dotenv()],
};
