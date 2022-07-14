const getSSRStateString = require('../../../../libs/get-ssr-state-string');
// const { get: getSSRContext } = require('../../../../libs/ssr/context');
const {
    ssrContext: SSRContext,
} = require('../../../../defaults/defines-server');
const { REDUXSTATE } = require('../../../../defaults/defines-window');

/** @type {String} 同步数据到 store 的静态方法名 */
const LIFECYCLE_DATA_TO_STORE = 'onServerRenderStoreExtend';
/** @type {String} 扩展 HTML 信息的静态方法名 */
const LIFECYCLE_HTML_EXTEND = 'onServerRenderHtmlExtend';

/**
 * 执行匹配到的组件的静态生命周期方法
 * @async
 * @param {Object} options
 * @param {Object} store Redux store 对象
 * @param {Object} renderProps 路由 `match` 结果中的属性对象，其内包含匹配到的组件的信息
 * @param {Object} ctx Koa context
 */
const executeComponentLifecycle = async ({ store, renderProps, ctx }) => {
    /** @type {Array} 需要执行的异步方法 */
    const tasks = [];

    /**
     * @type {Function}
     * @async
     * 扩展 HTML 信息需要执行的方法
     * 仅执行匹配到的最深层组件对应的方法
     */
    const extendHtmlTasks = [];

    const extractDataToStoreTask = (component) => {
        if (!component) return;
        if (typeof component[LIFECYCLE_DATA_TO_STORE] === 'function') {
            const thisTask = component[LIFECYCLE_DATA_TO_STORE]({
                store,
                renderProps,
                ctx,
            });
            // component[LIFECYCLE_DATA_TO_STORE] = undefined
            if (Array.isArray(thisTask)) {
                for (const task of thisTask) tasks.push(task);
            } else if (thisTask instanceof Promise || thisTask.then) {
                tasks.push(thisTask);
            } else if (typeof thisTask === 'function') {
                tasks.push(
                    new Promise(async (resolve, reject) => {
                        try {
                            await thisTask();
                            resolve();
                        } catch (e) {
                            reject(e);
                        }
                    })
                );
            }
        } else if (component.WrappedComponent) {
            extractDataToStoreTask(component.WrappedComponent);
        }
    };

    const extracHtmlExtendTask = (component) => {
        if (!component) return;
        if (typeof component[LIFECYCLE_HTML_EXTEND] === 'function') {
            extendHtmlTasks.push(component[LIFECYCLE_HTML_EXTEND]);
            // component[LIFECYCLE_HTML_EXTEND] = undefined
        } else if (component.WrappedComponent) {
            extracHtmlExtendTask(component.WrappedComponent);
        }
    };

    /** @type {Array} 使用 extend 高阶组件的组件 */
    let thisConnectedComponents = __DEV__
        ? (() => {
              const { connectedComponents = [] } = ctx[SSRContext];

              if (__DEV__) {
                  // 旧代码
                  // if (!global.__KOOT_SSR_DEV_CONNECTED_COMPONENTS__)
                  //     global.__KOOT_SSR_DEV_CONNECTED_COMPONENTS__ = new Map()

                  // const CTX = JSON.stringify(ctx)

                  // if (global.__KOOT_SSR_DEV_CONNECTED_COMPONENTS__.has(CTX))
                  //     return global.__KOOT_SSR_DEV_CONNECTED_COMPONENTS__.get(CTX)

                  // global.__KOOT_SSR_DEV_CONNECTED_COMPONENTS__.set(CTX, connectedComponents)

                  const renderPropsComponents = (
                      renderProps.components || []
                  ).filter((c) => !!c);
                  // 将 renderProps 中的 components 寄存入全局的 connectedComponents 中
                  renderPropsComponents
                      .filter(
                          (component) =>
                              component &&
                              connectedComponents.every(
                                  (c) => c.id !== component.id
                              )
                      )
                      .forEach((component) =>
                          connectedComponents.push(component)
                      );
                  // 将 renderProps 中的 components 移至队列最尾部
                  return connectedComponents;
                  // .filter(component =>
                  //     renderPropsComponents.every(c => c.id !== component.id)
                  // )
                  // .concat(renderPropsComponents);
              }

              return connectedComponents;
          })()
        : ctx[SSRContext].connectedComponents;
    // console.log('\n\n==========');
    // console.log({ connectedComponents });
    // console.log({ connectedComponents, renderProps });
    // console.log('==========\n\n');

    // 添加各项任务
    if (Array.isArray(thisConnectedComponents))
        thisConnectedComponents.forEach((component) => {
            extractDataToStoreTask(component);
            extracHtmlExtendTask(component);
        });

    thisConnectedComponents = undefined;

    // 旧代码
    // for (const component of renderProps.components) {
    //     /**
    //      * @type {Component}
    //      * 当前组件
    //      * component.WrappedComponent 是 redux 装饰的外壳
    //      */
    //     // const thisComponent = component && component.WrappedComponent ? component.WrappedComponent : component
    //     // extractDataToStoreTask(component)
    // }

    // 等待所有异步方法执行完毕
    await Promise.all(tasks).catch((e) => {
        throw e;
    });

    // 扩展 HTML 相关信息
    const result = {
        title: process.env.KOOT_PROJECT_NAME || '',
        metaHtml: '',
        reduxHtml: `window.${REDUXSTATE} = ${getSSRStateString(
            store.getState()
        )};`,
    };
    // console.log(extendHtmlTasks);
    extendHtmlTasks.some((task) => {
        if (typeof task === 'function') {
            const { title: thisTitle, metas: thisMetas } = task({
                store,
                renderProps,
                ctx,
            });

            // console.log({
            //     thisTitle,
            //     type: typeof thisTitle,
            //     result: process.env.KOOT_PROJECT_NAME,
            // });
            const hasTitle = typeof thisTitle !== 'undefined';
            const hasMeta = Array.isArray(thisMetas) && thisMetas.length;

            if (hasTitle) result.title = thisTitle;
            if (hasMeta)
                result.metaHtml = thisMetas
                    .map(
                        (meta) =>
                            '<meta' +
                            Object.keys(meta)
                                .map((key) => ` ${key}="${meta[key]}"`)
                                .join('') +
                            '>'
                    )
                    .join('');

            if (hasTitle || hasMeta) return true;
        }
        return false;
    });

    return result;
};

export default executeComponentLifecycle;
