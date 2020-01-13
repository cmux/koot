const fs = require('fs-extra');

const router = new require('koa-router')();

const {
    publicPathPrefix,
    serviceWorkerFilename
} = require('../../../defaults/webpack-dev-server');
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
    const uri = `${ctx.origin}/${publicPathPrefix}/dist/${serviceWorkerFilename}`;
    const res = await fetch(new Request(uri));
    ctx.body = await res.text();
    ctx.type = 'application/javascript';
});

export default router.routes();
