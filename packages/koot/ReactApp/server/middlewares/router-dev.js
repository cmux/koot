const fs = require('fs-extra');

const router = new require('koa-router')();

// const { pathnameSockjs } = require('../../../defaults/before-build');
const {
    publicPathPrefix,
    serviceWorkerFilename,
} = require('../../../defaults/webpack-dev-server');
const { dll, serviceWorker } = require('../../../defaults/dev-request-uri');
// const getWDSport = require('../../../utils/get-webpack-dev-server-port');

const getDevRoutes = require('../../../libs/get-dev-routes');

const { KOOT_DEV_DLL_FILE_CLIENT: fileDllClient } = process.env;

getDevRoutes().forEach(({ file, route }) => {
    router.get(route, (ctx) => {
        ctx.type = 'application/javascript';
        ctx.body = fs.readFileSync(file);
    });
});
router.get(dll, (ctx) => {
    if (fileDllClient && fs.existsSync(fileDllClient)) {
        ctx.type = 'application/javascript';
        ctx.body = fs.readFileSync(fileDllClient);
    } else {
        ctx.body = '';
    }
});

router.get(serviceWorker, async (ctx) => {
    const uri = `${ctx.origin}/${publicPathPrefix}/dist/${serviceWorkerFilename}`;
    const res = await fetch(new Request(uri));
    ctx.body = await res.text();
    ctx.type = 'application/javascript';
});

// router.get(`/${pathnameSockjs}/*`, async ctx => {
//     const portWebpackDevServer = getWDSport();
//     ctx.redirect(
//         `${ctx.protocol}://${ctx.hostname}:${portWebpackDevServer}${ctx.path}?${ctx.querystring}`
//     );
// });

export default router.routes();
