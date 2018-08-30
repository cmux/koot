const router = require('koa-router')()

router.get('/api/json-test', async (ctx) => {
    ctx.body = {
        "test": "json",
        "current_timestamp": Date.now()
    }
})

export default (app) => {
    app.use(router.routes())
}
