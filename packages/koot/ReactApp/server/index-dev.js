const fs = require('fs-extra');
const Koa = require('koa');
const mount = require('koa-mount');
const betterProxy = require('koa-better-http-proxy');
const proxy = require('koa-proxies');

const { publicPathPrefix } = require('../../defaults/webpack-dev-server');
const getWDSport = require('../../utils/get-webpack-dev-server-port');
const getPathnameDevServerStart = require('../../utils/get-pathname-dev-server-start');

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
    const { port, portServer } = await fs.readJson(getPathnameDevServerStart());

    if (
        global.kootTest ||
        (process.env.KOOT_TEST_MODE && JSON.parse(process.env.KOOT_TEST_MODE))
    ) {
        console.log(
            JSON.stringify({
                'koot-test': true,
                'process.env.SERVER_PORT': process.env.SERVER_PORT,
                __SERVER_PORT__,
                port
            })
        );
    }

    // console.log({ port, portServer })

    // 创建 KOA 服务器
    const app = new Koa();

    // 代理服务器 -> webpack dev server
    const proxyWebpackDevServer = new Koa();
    const portWebpackDevServer = getWDSport();

    proxyWebpackDevServer.use(
        betterProxy('localhost', {
            port: portWebpackDevServer,
            // 修改代理服务器请求返回结果
            userResDecorator: function(proxyRes, proxyResData, ctx) {
                const data = proxyResData.toString('utf8');

                if (/\ufffd/.test(data) === true) return proxyResData;

                const origin = ctx.origin.split('://')[1];

                // 替换 localhost 请求地址为当前代理服务器地址
                // 替换代理服务器地址的 sockjs-node 为 localhost 原始地址
                return data
                    .replace(
                        /:\/\/localhost:([0-9]+)/gm,
                        `://${origin}/${publicPathPrefix}`
                    )
                    .replace(
                        new RegExp(
                            `://${origin}/${publicPathPrefix}/sockjs-node/`,
                            'mg'
                        ),
                        `://localhost:${portWebpackDevServer}/sockjs-node/`
                    )
                    .replace(
                        /(socketUrl\s*=\s*url.format\({\s*protocol:\s*protocol,\s*auth:\s*urlParts.auth,\s*hostname:\s*hostname,\s*port:\s*)(port)/gm,
                        `$1${portWebpackDevServer}`
                    );
            }
        })
    );
    app.use(mount(`/${publicPathPrefix}`, proxyWebpackDevServer));

    // 代理服务器 -> 服务器端环境
    const proxyMain = new Koa();
    const regex = new RegExp(`^/((?!${publicPathPrefix}).*)`);
    proxyMain.use(
        proxy(regex, {
            target: `http://localhost:${portServer}`,
            changeOrigin: false,
            logs: false
        })
    );
    app.use(mount(proxyMain));

    // console.log({
    //     portWebpackDevServer,
    //     portServer,
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
