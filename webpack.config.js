"use strict";

var ExtractTextPlugin = require("extract-text-webpack-plugin"); //css单独打包
// var webpack = require('webpack'),
//     path = require('path'),
//     srcPath = path.join(__dirname, 'src'),
//     AsyncModulePlugin = require('async-module-loader/plugin')
module.exports = {
  entry: __dirname + "/src/entry.js", //唯一入口文件
  output: {
    path: __dirname + "/build", //打包后的文件存放的地方
    filename: "bundle.js" //打包后输出文件的文件名
  },

  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules)/,
        loader: "babel-loader",
        query: {
          presets: ["env", "react", "stage-1"],
          plugins: [["import", [{ libraryName: "antd", style: true }]]]
        }
      },
      { test: /\.json$/, loader: "json-loader" },
      {
        test: /\.(css|less)$/,
        loader: ExtractTextPlugin.extract("style", "css!less")
      },
      { test: /\.(png|jpg)$/, loader: "url?limit=8192" }
    ]
  },

  postcss: [
    require("autoprefixer") //调用autoprefixer插件,css3自动补全
  ],
  devtool: "#inline-source-map",
  devServer: {
    port: 3000,
    colors: true, //终端中输出结果为彩色
    historyApiFallback: true, //不跳转
    inline: true, //实时刷新
    host: "0.0.0.0",
    disableHostCheck: true,
    proxy: {
      "/api": {
        //target: 'http://172.17.3.108:8081/freelycar/api/',//fu
        // target: 'http://172.17.3.108:8080/freelycar/api/',//本地
        //  target: 'http://192.168.0.162:8080/freelycar/api/',
        //target: 'http://172.17.3.114:8081/freelycar/api/',//fu
        //target: 'http://www.freelycar.cn/api/',
        // target: 'http://172.17.3.115:8080/freelycar/api/',//xuan
        // target: 'http://172.17.3.151:8081/freelycar/api/',//yw

        //唐炜
        // target: 'http://localhost:8080/freelycar_xuzhuang/api/',
        //   target: 'http://192.168.0.167:8080/freelycar_xuzhuang/api/',

        //全民店
        // target: 'http://www.freelycar.com/quanmin/api/',

        //生产环境
        target: "http://www.freelycar.com/api/",
        changeOrigin: true,
        pathRewrite: { "^/api": "" }
      }
    }
  },
  publicPath: "/",
  plugins: [
    new ExtractTextPlugin("main.css")
    // new webpack.HotModuleReplacementPlugin(),
    // //new webpack.optimize.CommonsChunkPlugin({ name: "vendor", filename: "vendor.js" }),
    // new webpack.NamedModulesPlugin(),
    // new webpack.NoEmitOnErrorsPlugin(),
    // new webpack.LoaderOptionsPlugin({
    //     debug: true
    // })
  ]
};
