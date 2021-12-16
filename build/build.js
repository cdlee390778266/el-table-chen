'use strict'
const path = require('path')

console.log(path.resolve(__dirname, 'lib'), 99)
module.exports = {
  entry: {
    'el-table-chen': './src/libs/el-table-chen.js'
  },
  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: '[name].min.js'
  },
}
