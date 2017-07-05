const router = require('koa-router')()

router
    .get('*', async(ctx) => {
        return ctx.render('www-404.ejs');
    })


module.exports = router