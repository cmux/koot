const views = require('sp-koa-views')
const path = require('path')

export default (app) => {
    app.use(views(path.resolve(__dirname, '../views'), {
        extension: 'ejs'
    }))
}