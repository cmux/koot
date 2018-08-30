const body = require('koa-body')

export default (app) => {
    app.use(body({
        'formLimit': '5mb',
        'jsonLimit': '5mb',
        'textLimit': '5mb'
    }))
}