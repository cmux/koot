const fs = require('fs-extra');

const router = new require('koa-router')();

const { publicPathPrefix } = require('../../../defaults/webpack-dev-server');
const { dll, serviceWorker } = require('../../../defaults/dev-request-uri');

const { KOOT_DEV_DLL_FILE_CLIENT: fileDllClient } = process.env;

router.get(dll, ctx => {
    if (fileDllClient && fs.existsSync(fileDllClient)) {
        ctx.type = 'application/javascript';
        ctx.body = fs.readFileSync(fileDllClient);
    } else {
        ctx.body = '';
    }
});

router.get(serviceWorker, async ctx => {
    const uri = `${ctx.origin}/${publicPathPrefix}/dist${serviceWorker}`;
    const res = await fetch(new Request(uri));
    ctx.body = await res.text();
    ctx.type = 'application/javascript';
});

// const R =
// devRequestServiceWorker.substr(0, 1) === '/'
//     ? devRequestServiceWorker
//     : `/${devRequestServiceWorker}`;
// const proxyServer = new Koa();
// proxyServer.use(async (...args) => {
// console.log({
//     publicPathPrefix,
//     __: `http://localhost:${portWebpackDevServer}/${publicPathPrefix}`
// });
// return proxy('', {
//     target: `http://localhost:${portWebpackDevServer}/${publicPathPrefix}/dist`,
//     changeOrigin: true,
//     logs: true
// })(...args);
// });
// app.use(mount(R, proxyServer));

export default router.routes();
