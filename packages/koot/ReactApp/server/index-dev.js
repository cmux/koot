const fs = require('fs-extra');
const Koa = require('koa');
const mount = require('koa-mount');
const betterProxy = require('koa-better-http-proxy');
const proxy = require('koa-proxies');

const { pathnameSockjs } = require('../../defaults/before-build');
const { publicPathPrefix } = require('../../defaults/webpack-dev-server');
const getFlagFile = require('../../libs/get-flag-file');
const getWDSport = require('../../utils/get-webpack-dev-server-port');
const getPathnameDevServerStart = require('../../utils/get-pathname-dev-server-start');
// const log = require('../../libs/log');

/**
 * @async
 * 开发环境主服务器
 *
 *  - 唯一访问入口
 *  - 代理服务器 -> webpack dev server
 *  - 代理服务器 -> 服务器端环境
 *
 */
const run = async () => {
    const { port, portServer: portSSRServer } = await fs.readJson(
        getPathnameDevServerStart()
    );
    const portWebpackDevServer = getWDSport();

    /** 代理到其他地点的路由 */
    const routesProxy = [publicPathPrefix];

    if (
        global.kootTest ||
        (process.env.KOOT_TEST_MODE && JSON.parse(process.env.KOOT_TEST_MODE))
    ) {
        // eslint-disable-next-line no-console
        console.log(
            JSON.stringify({
                'koot-test': true,
                'process.env.SERVER_PORT': process.env.SERVER_PORT,
                __SERVER_PORT__,
                port,
            })
        );
    }

    // console.log({ port, portSSRServer, portWebpackDevServer })

    // 创建 KOA 服务器
    const app = new Koa();

    // 代理服务器 -> webpack dev server
    {
        const proxyWebpackDevServer = new Koa();

        proxyWebpackDevServer.use(
            betterProxy('localhost', {
                port: portWebpackDevServer,
                // 修改代理服务器请求返回结果
                userResDecorator: function (proxyRes, proxyResData, ctx) {
                    const data = proxyResData.toString('utf8');

                    if (/\ufffd/.test(data) === true) return proxyResData;

                    const origin = ctx.origin.split('://')[1];

                    // 替换 localhost 请求地址为当前代理服务器地址
                    // 替换代理服务器地址的 sockjs-node 为 localhost 原始地址
                    // console.log(ctx.href);
                    return data
                        .replace(
                            /:\/\/localhost:([0-9]+)/gm,
                            `://${origin}/${publicPathPrefix}`
                        )
                        .replace(
                            new RegExp(
                                `://${origin}/${publicPathPrefix}/${pathnameSockjs}/`,
                                'mg'
                            ),
                            `://${ctx.hostname}:${portWebpackDevServer}/${pathnameSockjs}/`
                        )
                        .replace(
                            /(socketUrl\s*=\s*url.format\({\s*protocol:\s*protocol,\s*auth:\s*urlParts.auth,\s*hostname:\s*)(hostname)(,\s*port:\s*)(port)/gm,
                            `$1"${ctx.hostname}"$3${portWebpackDevServer}`
                        );
                    // .replace(
                    //     /:\/\/localhost&sockHost=localhost&sockPort=[0-9]+/gm,
                    //     `://${ctx.hostname}&sockHost=${ctx.hostname}&sockPort=${portWebpackDevServer}`
                    // )
                    // .replace(/localhost/gm, ctx.hostname)
                },
            })
        );
        app.use(mount(`/${publicPathPrefix}`, proxyWebpackDevServer));
    }

    // 代理服务器 -> WSD 代理服务器
    {
        const { proxy: proxyConfig = {} } = JSON.parse(
            process.env.KOOT_DEV_WDS_EXTEND_CONFIG
        );
        proxyConfig[pathnameSockjs] = true;
        if (typeof proxyConfig === 'object') {
            for (const route of Object.keys(proxyConfig)) {
                const { changeOrigin = false } = proxyConfig[route];
                // console.log(route, changeOrigin);
                routesProxy.push(
                    route.substr(0, 1) === '/' ? route.substr(1) : route
                );
                const wdsProxy = new Koa();
                const R = route.substr(0, 1) === '/' ? route : `/${route}`;
                wdsProxy.use(async (ctx) => {
                    return proxy('/', {
                        target: `http://${ctx.hostname}:${portWebpackDevServer}${R}`,
                        changeOrigin,
                        logs: true,
                    })(ctx);
                });
                // wdsProxy.use(async () => {
                //     log(
                //         'success',
                //         'server',
                //         `webpack-dev-server proxy matched: ${route}`
                //     );
                // });
                app.use(mount(R, wdsProxy));
            }
        }
    }

    // 代理服务器 -> SSR server
    {
        const proxyMain = new Koa();
        const regex = new RegExp(`^/((?!${routesProxy.join('|')}).*)`);
        /** 等待 flag 文件的超时设定 */
        const timeout = 2 * 1000;
        proxyMain.use(async (ctx, next) => {
            const flagFile = getFlagFile.devBuildingServer();
            // console.log(flagFile, fs.existsSync(flagFile))
            await new Promise((resolve) => {
                const s = Date.now();
                const waiting = () =>
                    setTimeout(async () => {
                        if (!fs.existsSync(flagFile)) return resolve();
                        if (Date.now() - s > timeout) return resolve();
                        waiting();
                    }, 100);
                waiting();
            });
            await proxy(regex, {
                target: `http://127.0.0.1:${portSSRServer}`,
                changeOrigin: false,
                logs: false,
            })(ctx, next);
        });
        app.use(mount(proxyMain));
    }
    // console.log({
    //     portWebpackDevServer,
    //     portSSRServer,
    //     port,
    //     publicPathPrefix,
    //     mount,
    //     app
    // });

    app.listen(port);

    // fs.writeFileSync(
    //     getPathnameDevServerStart(),
    //     ` `,
    //     'utf-8'
    // )
};

run();
