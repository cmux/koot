const Koa = require('koa')
const app = new Koa()
const koaStatic = require('koa-static')
const path = require('path')

app.use(koaStatic(
    path.resolve(__dirname, './projects/standard/dist-spa/'),
    {
        maxage: 0,
        hidden: true,
        index: 'index.html',
        defer: false,
        gzip: true,
        extensions: false
    }
))

app.listen('8080')
