// import { server as serverConfig } from '__KOOT_PROJECT_CONFIG_PORTION_SERVER_PATHNAME__';

import koaStaticDefaults from '../../defaults/koa-static';
import getDirDistPublic from '../../libs/get-dir-dist-public';
import getDistPath from '../../utils/get-dist-path';

const Koa = require('koa');
const koaStatic = require('koa-static');
const convert = require('koa-convert');

const errorMsg = require('../../libs/error-msg');
const validatePort = require('../../libs/validate-port');

/**
 * 启动 SPA 服务器
 * @async
 */
const startSPAServer = async () => {
    if (process.env.WEBPACK_BUILD_ENV === 'dev') return;

    console.log(`\r\n  \x1b[93m[koot/server]\x1b[0m initializing...`);
    // const { before: serverBefore, after: serverAfter } = serverConfig;

    // 决定服务器启动端口
    // 如果端口不可用，取消启动流程
    /** @type {Number} 服务器启动端口 */
    const port = await validatePort();
    if (!port) throw new Error(errorMsg('VALIDATE_PORT', 'unavailable'));

    // 创建 Koa 实例 (app)
    /** @type {Koa} Koa 服务器实例 */
    const app = new Koa();

    // 挂载中间件: 静态服务器
    app.use(
        staticMiddleware(
            (() => {
                // if (typeof serverConfig.koaStatic === 'object')
                //     return serverConfig.koaStatic;
                // if (typeof serverConfig.static === 'object')
                //     return serverConfig.static;
                return {};
            })()
        )
    );

    // 生命周期: 服务器启动前
    // if (typeof serverBefore === 'function') await serverBefore(app);

    // 生命周期: 服务器即将启动
    // if (typeof serverAfter === 'function') await serverAfter(app);

    // 启动服务器
    await new Promise(resolve => {
        app.listen(port);
        setTimeout(() => {
            console.log(
                `\x1b[32m√\x1b[0m ` +
                    `\x1b[93m[koot/server]\x1b[0m listening port \x1b[32m${port}\x1b[0m`
            );
            console.log(' ');
            return resolve();
        });
    }).catch(err => {
        if (err instanceof Error)
            err.message = errorMsg('KOA_APP_LAUNCH', err.message);
        throw err;
    });
};

startSPAServer().catch(err => {
    console.error(err);
});

//

/**
 * KOA 中间件: 静态资源
 * @param {Object} koaStaticConfig
 * @return {Function}
 */
const staticMiddleware = (koaStaticConfig = {}) => {
    const dir = getDistPath();
    const config = Object.assign({}, koaStaticDefaults, koaStaticConfig);
    // console.log('koa-statc', {
    //     dir,
    //     config,
    //     koaStaticDefaults,
    //     koaStaticConfig
    // });
    return convert(koaStatic(dir, config));
};
