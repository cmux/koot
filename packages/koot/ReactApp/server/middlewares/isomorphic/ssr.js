import __KOOT_GET_DIST_PATH__ from '../../../../utils/get-dist-path';
import {
    ssrContext as SSRContext,
    koaContext as KOAContext,
} from '../../../../defaults/defines-server';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

/** @type {String} ssr.js 文件内容 */
// let __KOOT_SSR_FILE_CONTENT__;
let __KOOT_SSR_SCRIPT__;

const context = {
    version: parseInt(process.versions.node.split('.')[0]),
    // eslint-disable-next-line no-eval
    require: eval('require'),
    // eslint-disable-next-line no-eval
    // module: eval('module'),
    module,
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
    // eslint-disable-next-line no-eval
    __dirname: eval('__dirname'),
};

/**
 * 执行服务器端渲染 (Server-Side Rendering)
 */
const ssr = __DEV__
    ? (ctx) =>
          new Promise((resolve) => {
              ctx[SSRContext].ssrComplete = resolve;
              require('../../ssr')
                  .default(ctx)
                  .catch((error) => {
                      resolve({
                          error,
                      });
                  });
          })
    : (ctx) =>
          new Promise((resolve, reject) => {
              const ssrComplete = (result) => {
                  // return resolve('hello');
                  // setTimeout(function () {
                  //     __KOOT_SSR__ = false;
                  // });

                  // setTimeout(function () {
                  // 砍断 thisContext 的引用
                  if (thisContext && typeof thisContext === 'object') {
                      for (const key of Object.keys(thisContext).filter(
                          (key) => key !== 'global' && key !== KOAContext
                      ))
                          delete thisContext[key];
                      purgeObject(thisContext.global);
                      delete thisContext.global;
                      // delete thisContext[KOAContext]
                  }
                  thisContext = undefined;
                  purgeSSRContext(ctx);

                  resolve(result);
                  // });
              };
              ctx[SSRContext].ssrComplete = ssrComplete;

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
                      reject(
                          new Error(
                              "No `/server/ssr.js` found. Maybe there's an error while building. Please retry `koot-build`"
                          )
                      );
                  }
              }

              // let __KOOT_SSR__ = ctx[SSRContext];
              let thisContext = {
                  ...context,
                  global: {},
                  [KOAContext]: ctx,
              };

              // 针对腾讯云 serverless
              // 目标环境 global 上有一个 gc 对象
              if (typeof global.gc !== 'undefined') thisContext.gc = global.gc;

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
                  // const __KOOT_CTX__ = ctx;
                  // eslint-disable-next-line no-eval
                  // eval(__KOOT_SSR_FILE_CONTENT__);
                  __KOOT_SSR_SCRIPT__.runInContext(thisContext);
                  // __KOOT_SSR_SCRIPT__.runInThisContext();
              } catch (err) {
                  ssrComplete({
                      error: err,
                  });
              }
          });

export default ssr;

// ============================================================================

/**
 * 清理 SSR Context 对象。清楚内容
 * - 所有第一级的对象
 * - store
 * - ctx 上的 Context 对象
 * @param {*} ctx
 */
const purgeSSRContext = (ctx) => {
    if (__DEV__) return;

    // console.log('purging...', ctx[SSRContext]);

    if (typeof ctx[SSRContext] === 'object') {
        purgeObject(ctx[SSRContext].connectedComponents);
        purgeObject(ctx[SSRContext].History);
        // purgeObject(ctx[SSRContext].Store);
        purgeObject(ctx[SSRContext].styleMap);
        purgeObject(ctx[SSRContext].template);

        // store
        if (typeof ctx[SSRContext].Store === 'object') {
            // delete ctx[SSRContext].Store['Symbol(observable)'];
            let state = ctx[SSRContext].Store.getState();
            purgeObject(state);
            state = undefined;
            for (const key of Object.keys(ctx[SSRContext].Store))
                delete ctx[SSRContext].Store[key];
        }

        for (const key of Object.keys(ctx[SSRContext]))
            delete ctx[SSRContext][key];
    }
    delete ctx[SSRContext];

    // console.log('purged...', ctx[SSRContext]);
    // console.log(' \n\n\n\n\n ');
};

const purgeObject = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    for (const key of Object.keys(obj)) {
        if (typeof obj[key] === 'object') purgeObject(obj[key]);
        delete obj[key];
    }
};
