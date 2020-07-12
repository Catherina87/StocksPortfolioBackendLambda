const path = require("path");

const entryFile = process.env.FILE_ENTRY || "./src/index.ts";

module.exports = {
  mode: "production",
  entry: entryFile,
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js"],
    modules: [
      "node_modules"
    ]
  },
  target: "node",
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "dist/"),
    libraryTarget: "commonjs2",
    library: "umd"
  },
  plugins: []
};