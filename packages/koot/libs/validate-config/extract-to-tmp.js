const path = require('path');
const { typesSPA } = require('../../defaults/before-build');
const validatePathname = require('../../libs/validate-pathname');

/**
 * 从配置中抽取代码中引用的配置文件 (这些文件将存放到临时目录中)
 * @async
 * @param {String} projectDir
 * @param {Object} config
 * @returns {Object}
 */
module.exports = async (projectDir, config) => {
    /** @type {Object} 引用配置的配置对象 */
    const tmpConfig = (() => {
        const obj = {
            name: config.name || '',
            type: config.type,
            template: config.template,
            router: config.routes,
            redux: (() => {
                const redux = {};

                if (config.store) redux.store = config.store;
                else if (config.reducers)
                    redux.combineReducers = config.reducers;

                if (typeof config.cookiesToStore !== 'undefined')
                    redux.syncCookie = config.cookiesToStore;

                return redux;
            })(),
            client: (() => {
                const client = {};
                if (config.historyType) client.historyType = config.historyType;
                if (config.before) client.before = config.before;
                if (config.after) client.after = config.after;
                if (config.onRouterUpdate)
                    client.onRouterUpdate = config.onRouterUpdate;
                if (config.onHistoryUpdate)
                    client.onHistoryUpdate = config.onHistoryUpdate;
                return client;
            })(),
            devServer: config.devServer
        };

        if (!obj.devServer) delete obj.devServer;

        // SPA
        if (typesSPA.includes(config.type)) {
            // if (config.templateInject) obj.inject = config.templateInject
        } else {
            obj.server = (() => {
                const server = {};
                const extract = (keyInConfig, keyInServer) => {
                    if (typeof config[keyInConfig] !== 'undefined')
                        server[keyInServer] = config[keyInConfig];
                };
                extract('koaStatic', 'koaStatic');
                extract('renderCache', 'renderCache');
                extract('proxyRequestOrigin', 'proxyRequestOrigin');
                extract('templateInject', 'inject');
                extract('serverBefore', 'before');
                extract('serverAfter', 'after');
                extract('serverOnRender', 'onRender');
                return server;
            })();
        }

        // 将所有 Pathname 字符串转为 require()
        const optionsNeedImport = [
            'router',
            'redux.combineReducers',
            'redux.store',
            'client.before',
            'client.after',
            'client.onRouterUpdate',
            'client.onHistoryUpdate',
            'server.reducers',
            'server.inject',
            'server.before',
            'server.after',
            'server.onRender',
            'server.onRender.beforeRouterMatch',
            'server.onRender.beforePreRender',
            'server.onRender.beforeDataToStore',
            'server.onRender.afterDataToStore',
            'inject'
        ];
        optionsNeedImport.forEach(key => {
            try {
                // eslint-disable-next-line no-eval
                if (eval(`typeof obj.${key} === 'string' && obj.${key}`)) {
                    // eslint-disable-next-line no-eval
                    const value = eval(`obj.${key}`);
                    const pathname = path.isAbsolute(value)
                        ? value
                        : validatePathname(value, projectDir).replace(
                              /\\/g,
                              '\\\\'
                          );
                    const result = path.isAbsolute(pathname)
                        ? pathname.replace(/\\/g, '\\\\')
                        : '../../../' + pathname.replace(/^\.\//, '');
                    // eslint-disable-next-line no-eval
                    eval(`obj.${key} = \`require('${result}').default\``);
                }
            } catch (e) {}
        });

        return obj;
    })();

    /** @type {String[]} 引用配置 (部分) 需要的配置项 */
    const propertiesPortion = ['template', 'redux', 'server'];

    /** @type {Object} 引用配置 (部分) 的配置对象 */
    const tmpConfigPortionServer = {};
    propertiesPortion.forEach(key => {
        if (typeof tmpConfig[key] === 'object')
            tmpConfigPortionServer[key] = { ...tmpConfig[key] };
        else if (tmpConfig[key]) tmpConfigPortionServer[key] = tmpConfig[key];
    });
    if (typeof tmpConfigPortionServer.server === 'object')
        delete tmpConfigPortionServer.server.onRender;

    const tmpConfigPortionClient = { ...tmpConfigPortionServer };
    const tmpConfigPortionOtherClient = { ...tmpConfig };
    delete tmpConfigPortionServer.redux;
    delete tmpConfigPortionServer.devServer;
    delete tmpConfigPortionClient.server;
    delete tmpConfigPortionClient.devServer;
    delete tmpConfigPortionOtherClient.redux;
    delete tmpConfigPortionOtherClient.template;
    delete tmpConfigPortionOtherClient.server;
    delete tmpConfigPortionOtherClient.devServer;

    /**
     * 将对象结果转为字符串
     * @param {Object} config
     * @returns {String}
     */
    const transform = config => {
        return Object.keys(config)
            .map(key => {
                if (key === 'server')
                    return `export const ${key} = __SERVER__ ? ${JSON.stringify(
                        config[key]
                    )} : {};`;
                // if (key === 'router' && process.env.WEBPACK_BUILD_ENV === 'dev')
                //     return `export const ${key} = () => {console.log(123); return ${JSON.stringify(config[key])}};`
                return `export const ${key} = ${JSON.stringify(config[key])};`;
            })
            .join('\n')
            .replace(/"require\((.+?)\).default"/g, `require($1).default`);
    };

    return {
        tmpConfig: '// 核心代码中引用的配置文件\n\n' + transform(tmpConfig),
        tmpConfigPortionServer:
            '// 核心代码中引用的配置文件 (部分)\n\n' +
            transform(tmpConfigPortionServer),
        tmpConfigPortionClient:
            '// 核心代码中引用的配置文件 (部分)\n\n' +
            transform(tmpConfigPortionClient),
        tmpConfigPortionOtherClient:
            '// 核心代码中引用的配置文件 (部分其他)\n\n' +
            transform(tmpConfigPortionOtherClient)
    };
};
