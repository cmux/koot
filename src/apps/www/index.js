const Koa = require('koa')
const app = new Koa()
const router = require('./router')


// ejs 模板引擎
const views = require('sp-koa-views')
app.use(views(__dirname + '/views', {
    extension: 'ejs'
}))


app.use(router.routes())


module.exports = app
