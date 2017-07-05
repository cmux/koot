// 处理 es6\es7
require('babel-core/register')
require('babel-polyfill')

// 加载全局变量
require('./system/global')

// 前后端同构使用统一的 fetch 数据方式
require('isomorphic-fetch')

// babel 处理入口文件
require('./system/server')
