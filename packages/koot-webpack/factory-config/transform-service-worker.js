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
    devServiceWorker // = defaultDevServiceWorker
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
                devServiceWorker === true ? serviceWorker : devServiceWorker
        });
    }

    if (serviceWorker === true || typeof serviceWorker === 'undefined') {
        serviceWorker = Object.assign({}, defaults);
        process.env.KOOT_PWA_AUTO_REGISTER = JSON.stringify(serviceWorker.auto);
        process.env.KOOT_PWA_PATHNAME = JSON.stringify(
            serviceWorker.pathname ||
                (serviceWorker.filename ? `/${serviceWorker.filename}` : '')
        );
        return serviceWorker;
    }

    if (typeof serviceWorker === 'object') {
        serviceWorker = Object.assign({}, defaults, serviceWorker);
        process.env.KOOT_PWA_AUTO_REGISTER = JSON.stringify(serviceWorker.auto);
        process.env.KOOT_PWA_PATHNAME = JSON.stringify(
            serviceWorker.pathname ||
                (serviceWorker.filename ? `/${serviceWorker.filename}` : '')
        );
        return serviceWorker;
    }

    process.env.KOOT_PWA_AUTO_REGISTER = JSON.stringify(false);
    return false;
};

module.exports = transformServiceWorker;
