require('babel-core/register')

// 处理es6\es7
require('babel-polyfill')

// 前后端同构使用统一的fetch数据方式
require('isomorphic-fetch')

require('./server')