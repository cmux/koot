const fs = require('fs-extra');

const router = new require('koa-router')();

const { dll } = require('../../../defaults/dev-request-uri');

const { KOOT_DEV_DLL_FILE_CLIENT: fileDllClient } = process.env;

router.get(dll, ctx => {
    if (fileDllClient && fs.existsSync(fileDllClient)) {
        ctx.type = 'application/javascript';
        ctx.body = fs.readFileSync(fileDllClient);
    } else {
        ctx.body = '';
    }
});

export default router.routes();
