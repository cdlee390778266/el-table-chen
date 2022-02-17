const path = require('path')
const webpack = require("webpack")

module.exports = {
  entry: {
    'el-table-chen': './src/libs/el-table-chen.js'
  },
  output: {
    path: path.resolve(__dirname, '../lib'),
    filename: '[name].min.js',
    library: 'el_table_chen',
    libraryTarget: 'umd'
  },
  module: {
    rules: [{
        test: /\.vue$/,
        use: 'vue-loader'
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,

      }
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: { //压缩代码
        dead_code: true, //移除没被引用的代码
        warnings: false, //当删除没有用处的代码时，显示警告
        loops: true //当do、while 、 for循环的判断条件可以确定是，对其进行优化
      }
    })
  ]
}
