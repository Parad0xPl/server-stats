const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const eCSS = new ExtractTextPlugin("libs.css");

module.exports = {
  context: __dirname,
  entry: {
    main: path.join(__dirname, "webSource/index.js")
  },
  output: {
    path: "web/",
    filename: "bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: eCSS.extract({
          fallback: "style-loader",
          use: "css-loader"
        })
      },
      {
        test: /\.vue$/,
        use:"vue-loader"
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
        jQuery: 'jquery',
        $: 'jquery',
        jquery: 'jquery',
        Tether: 'tether'
    }),
    eCSS
  ],
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.common.js',
      'vue-router': "vue-router/dist/vue-router.common.js"
    }
  }
};
