const router = require('koa-router')();

router.get('/api/json-test', async ctx => {
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.body = {
        test: 'json',
        current_timestamp: Date.now()
    };
});

router.get('/api/app-name', async ctx => {
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.body = 'Koot.js';
});

export default app => {
    app.use(router.routes());
};
