/* eslint-disable no-console */
/* __KOOT_DEV_SSR__ */

// import koaCompress from 'koa-compress';
import {
    template as templateConfig,
    server as serverConfig
} from '__KOOT_PROJECT_CONFIG_PORTION_SERVER_PATHNAME__';

import createKoaApp from '../../libs/create-koa-app';
import log from '../../libs/log';

import createRenderCacheMap from './validate/create-render-cache-map';
import validateI18n from './validate/i18n';
import validateTemplate from './validate/template';

import middlewareRouterDev from './middlewares/router-dev';
import middlewareIsomorphic from './middlewares/isomorphic';
import middlewareStatic from './middlewares/static';

// ============================================================================

console.log(
    `\r\n  \x1b[93m[koot/server]\x1b[0m Initializing for serverless app...`
);

const {
    before: serverBefore,
    after: serverAfter,
    renderCache: renderCacheConfig,
    proxyRequestOrigin,
    inject: templateInject
} = serverConfig;

// 确定 Redux 相关配置
// const reduxConfig = await validateReduxConfig(reduxConfigRaw)

// 确定模板内容
const template = validateTemplate(templateConfig);

// 渲染缓存
const renderCacheMap = createRenderCacheMap(renderCacheConfig);

// 语言包写入内存
const locales = !__DEV__ ? validateI18n() : {};

/** Koa app 实例 */
const app = createKoaApp();

// 生命周期: 服务器启动前
if (__DEV__)
    log('callback', 'server', `callback: \x1b[32m${'before'}\x1b[0m(app)`);
if (typeof serverBefore === 'function') serverBefore(app);

// [开发环境] 挂载中间件: 主服务器代理
if (__DEV__) app.use(middlewareRouterDev);

// [生产环境] 挂载中间件: 静态资源压缩
// if (!__DEV__)
//     app.use(
//         koaCompress({
//             filter: contentType =>
//                 /^text\//i.test(contentType) ||
//                 /\/(javascript|css|json|ld\+json)$/i.test(contentType),
//             threshold: 2048,
//             flush: require('zlib').Z_SYNC_FLUSH
//         })
//     );

// 挂载中间件: 静态资源访问
app.use(
    middlewareStatic(
        (() => {
            if (typeof serverConfig.koaStatic === 'object')
                return serverConfig.koaStatic;
            if (typeof serverConfig.static === 'object')
                return serverConfig.static;
            return {};
        })()
    )
);

// 挂载中间件: 同构服务器
app.use(
    middlewareIsomorphic({
        // reduxConfig,
        renderCacheMap,
        locales,
        proxyRequestOrigin,
        template,
        templateInject
    })
);

// 生命周期: 服务器即将启动
if (__DEV__)
    log('callback', 'server', `callback: \x1b[32m${'after'}\x1b[0m(app)`);
if (typeof serverAfter === 'function') serverAfter(app);

// [开发环境] 中间件: 请求完成后，触发 server/index.js 保存，让 PM2 重启服务器
if (__DEV__) {
    app.use(async (ctx, next) => {
        await next();
        console.log('  ');
        log('success', 'server', 'render success');
        console.log('  ');
        console.log('  ');
        console.log('  ');
        console.log('  ');
        console.log('  ');
        //     const fileServer = path.resolve(getDist(), 'server/index.js');
        //     if (fs.existsSync(fileServer)) {
        //         await sleep(200);
        //         const content = await fs.readFile(fileServer, 'utf-8');
        //         await fs.writeFile(fileServer, content, 'utf-8');
        //     }
    });
}

// 初始化完成，准备启动服务器
log('success', 'server', `init \x1b[32m${'OK'}\x1b[0m!`);

export default app;
