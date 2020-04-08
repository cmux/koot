import __KOOT_GET_DIST_PATH__ from '../../../../utils/get-dist-path';

const fs = require('fs-extra');
const path = require('path');
const vm = require('vm');

/** @type {String} ssr.js 文件内容 */
// let __KOOT_SSR_FILE_CONTENT__;
let __KOOT_SSR_SCRIPT__;

const context = {
    version: parseInt(process.versions.node.split('.')[0]),
    // eslint-disable-next-line no-eval
    require: eval('require'),
    process,
    console,
    global,
    setTimeout,
    setInterval,
    setImmediate,
    clearTimeout,
    clearInterval,
    clearImmediate,
    // String,
    // Number,
    Buffer,
    // Boolean,
    // Array,
    // Date,
    // Error,
    // EvalError,
    // RangeError,
    // ReferenceError,
    // SyntaxError,
    // TypeError,
    // URIError,
    // RegExp,
    // Function,
    // Object,
    // Proxy,
    // Reflect,
    // Map,
    // WeakMap,
    // Set,
    // WeakSet,
    // Promise,
    // Symbol,
};

/**
 * 执行服务器端渲染 (Server-Side Rendering)
 */
const ssr = (ctx) =>
    new Promise(async (resolve) => {
        const ssrComplete = (result) => {
            // setTimeout(function () {
            //     __KOOT_SSR__ = false;
            // });
            resolve(result);
            // thisContext = undefined;
        };
        ctx.__KOOT_SSR__.ssrComplete = ssrComplete;

        if (__DEV__) {
            return await require('../../ssr')
                .default()
                .catch((err) =>
                    ssrComplete({
                        error: err,
                    })
                );
        }

        // if (!__KOOT_SSR_FILE_CONTENT__) {
        //     const fileSSR = path.resolve(
        //         __KOOT_GET_DIST_PATH__(),
        //         'server/ssr.js'
        //     );
        //     if (fs.existsSync(fileSSR)) {
        //         __KOOT_SSR_FILE_CONTENT__ = fs.readFileSync(fileSSR, 'utf-8');
        //     } else {
        //         throw new Error(
        //             "No `/server/ssr.js` found. Maybe there's an error while building. Please retry `koot-build`"
        //         );
        //     }
        // }

        if (!__KOOT_SSR_SCRIPT__) {
            const fileSSR = path.resolve(
                __KOOT_GET_DIST_PATH__(),
                'server/ssr.js'
            );
            if (fs.existsSync(fileSSR)) {
                __KOOT_SSR_SCRIPT__ = new vm.Script(
                    fs.readFileSync(fileSSR, 'utf-8')
                );
            } else {
                throw new Error(
                    "No `/server/ssr.js` found. Maybe there's an error while building. Please retry `koot-build`"
                );
            }
        }

        ctx.__KOOT_SSR__.setStore = function (value) {
            ctx.__KOOT_SSR__.Store = value;
        };
        ctx.__KOOT_SSR__.setHistory = function (value) {
            ctx.__KOOT_SSR__.History = value;
        };
        ctx.__KOOT_SSR__.ctx = ctx;

        // let __KOOT_SSR__ = ctx.__KOOT_SSR__;
        const thisContext = {
            ...context,
        };

        Object.defineProperties(thisContext, {
            __KOOT_SSR__: {
                configurable: false,
                enumerable: false,
                writable: false,
                value: ctx.__KOOT_SSR__,
            },
            Store: {
                configurable: false,
                enumerable: false,
                get: function () {
                    return ctx.__KOOT_SSR__.Store;
                },
            },
            History: {
                configurable: false,
                enumerable: false,
                get: function () {
                    return ctx.__KOOT_SSR__.History;
                },
            },
        });

        try {
            // eslint-disable-next-line no-eval
            // eval(__KOOT_SSR_FILE_CONTENT__);
            // (function () {
            //     // eslint-disable-next-line no-eval
            //     eval(__KOOT_SSR_FILE_CONTENT__);
            // })();
            __KOOT_SSR_SCRIPT__.runInNewContext(thisContext);
        } catch (err) {
            ssrComplete({
                error: err,
            });
        }
    });

export default ssr;
