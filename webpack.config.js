const path = require("path");
const webpack = require("webpack");
const Dotenv = require("dotenv-webpack");

module.exports = () => {
  return {
    mode: "development",
    entry: "./src/index.js",
    output: {
      filename: "bundle.js",
      path: path.resolve(__dirname, "static"),
    },
    resolve: {
      extensions: [".js", ".jsx"],
      alias: {
        "@": path.resolve(__dirname, "src/"),
      },
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          include: [path.resolve(__dirname, "src")],
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: [
                ["@babel/preset-env", { targets: "defaults" }],
                "@babel/preset-react",
              ],
            },
          },
        },
        {
          test: /\.s?css$/,
          use: ["style-loader", "css-loader", "postcss-loader"],
        },
      ],
    },
    plugins: [new Dotenv({ systemvars: true })],
  };
};
