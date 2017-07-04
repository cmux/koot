// 处理 es6\es7
require('babel-core/register')
require('babel-polyfill')

// 前后端同构使用统一的 fetch 数据方式
require('isomorphic-fetch')

// babel 处理入口文件
require('./server')