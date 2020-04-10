import __KOOT_GET_DIST_PATH__ from '../../../../utils/get-dist-path';
import {
    ssrContext as SSRContext,
    koaContext as KOAContext,
} from '../../../../defaults/defines-server';

const fs = require('fs-extra');
const path = require('path');
const vm = require('vm');

/** @type {String} ssr.js 文件内容 */
// let __KOOT_SSR_FILE_CONTENT__;
let __KOOT_SSR_SCRIPT__;

const context = {
    version: parseInt(process.versions.node.split('.')[0]),
    process,
    console,
    // global,
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
            // return resolve('hello');
            // setTimeout(function () {
            //     __KOOT_SSR__ = false;
            // });
            resolve(result);
            // thisContext = undefined;
        };
        ctx[SSRContext].ssrComplete = ssrComplete;

        if (__DEV__) {
            return await require('../../ssr')
                .default(ctx)
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
                    fs.readFileSync(fileSSR, 'utf-8'),
                    {
                        filename: fileSSR,
                    }
                );
            } else {
                throw new Error(
                    "No `/server/ssr.js` found. Maybe there's an error while building. Please retry `koot-build`"
                );
            }
        }

        ctx[SSRContext].setStore = function (value) {
            ctx[SSRContext].Store = value;
        };
        ctx[SSRContext].setHistory = function (value) {
            ctx[SSRContext].History = value;
        };

        // let __KOOT_SSR__ = ctx[SSRContext];
        const thisContext = {
            ...context,
            // eslint-disable-next-line no-eval
            require: eval('require'),
            global: {},
            [KOAContext]: ctx,
        };

        // Object.defineProperties(thisContext, {
        //     [SSRContext]: {
        //         configurable: false,
        //         enumerable: false,
        //         writable: false,
        //         value: ctx[SSRContext],
        //     },
        //     Store: {
        //         configurable: false,
        //         enumerable: false,
        //         get: function () {
        //             return ctx[SSRContext].Store;
        //         },
        //     },
        //     History: {
        //         configurable: false,
        //         enumerable: false,
        //         get: function () {
        //             return ctx[SSRContext].History;
        //         },
        //     },
        // });

        vm.createContext(thisContext);

        try {
            // eslint-disable-next-line no-eval
            // eval(__KOOT_SSR_FILE_CONTENT__);
            // (function () {
            //     // eslint-disable-next-line no-eval
            //     eval(__KOOT_SSR_FILE_CONTENT__);
            // })();
            __KOOT_SSR_SCRIPT__.runInContext(thisContext);
        } catch (err) {
            ssrComplete({
                error: err,
            });
        }
    });

export default ssr;
