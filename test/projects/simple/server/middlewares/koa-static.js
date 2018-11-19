const koaStatic = require('koa-static')

export default (app) => {
    const appRunPath = process.cwd()
    app.use(koaStatic(`${appRunPath}/dist/public`, {
        maxage: 0,
        hidden: true,
        index: 'index.html',
        defer: false,
        gzip: true,
        extensions: false
    }))
}