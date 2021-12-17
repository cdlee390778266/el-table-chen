const path = require('path')

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
    }]
  }
}
