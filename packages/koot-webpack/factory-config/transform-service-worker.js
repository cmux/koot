const defaults = require('koot/defaults/service-worker');
// const {
//     devServiceWorker: defaultDevServiceWorker
// } = require('koot/defaults/koot-config');

/**
 * 处理 PWA 配置。以下内容写入环境变量
 *   - KOOT_PWA_AUTO_REGISTER - 是否自动注册
 *   - KOOT_PWA_PATHNAME - 模板 service-worker 文件的本地路径 (目前只有 SPA 使用)
 * @async
 * @param {KootConfigObject} kootConfig
 * @return {Boolean|Object} 不可用 (false) 或完整配置对象
 */
const transformServiceWorker = async ({
    serviceWorker,
    devServiceWorker, // = defaultDevServiceWorker
}) => {
    if (
        process.env.WEBPACK_BUILD_ENV === 'dev' &&
        typeof devServiceWorker !== 'undefined'
    ) {
        // console.log({
        //     serviceWorker,
        //     devServiceWorker
        // });
        return await transformServiceWorker({
            serviceWorker:
                devServiceWorker === true ? serviceWorker : devServiceWorker,
        });
    }

    const isSPA = process.env.WEBPACK_BUILD_TYPE === 'spa';
    defaults.scope = isSPA ? '' : '/';
    let config;

    if (serviceWorker === true || typeof serviceWorker === 'undefined') {
        config = Object.assign({}, defaults);
    } else if (typeof serviceWorker === 'object') {
        config = Object.assign({}, defaults, serviceWorker);
    }

    if (typeof config === 'object') {
        process.env.KOOT_PWA_AUTO_REGISTER = JSON.stringify(config.auto);
        process.env.KOOT_PWA_PATHNAME = JSON.stringify(
            config.pathname ||
                (config.filename ? `${isSPA ? '' : '/'}${config.filename}` : '')
        );
        process.env.KOOT_PWA_SCOPE = JSON.stringify(config.scope);
        return config;
    }

    process.env.KOOT_PWA_AUTO_REGISTER = JSON.stringify(false);
    return false;
};

module.exports = transformServiceWorker;
