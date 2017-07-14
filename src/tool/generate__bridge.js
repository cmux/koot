
global.__BUILD__ = true

// 处理 es6\es7
require('babel-core/register')
require('babel-polyfill')


require('./logic')

