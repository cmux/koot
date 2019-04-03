/* global __KOOT_SSR__:false */

/** @type {String} 同步数据到 store 的静态方法名 */
const LIFECYCLE_DATA_TO_STORE = 'onServerRenderStoreExtend'
/** @type {String} 扩展 HTML 信息的静态方法名 */
const LIFECYCLE_HTML_EXTEND = 'onServerRenderHtmlExtend'


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
    let tasks = []

    /**
     * @type {Function}
     * @async
     * 扩展 HTML 信息需要执行的方法
     * 仅执行匹配到的最深层组件对应的方法
     */
    let extendHtml

    const extractDataToStoreTask = (component) => {
        if (!component) return
        if (typeof component[LIFECYCLE_DATA_TO_STORE] === 'function') {
            const thisTask = component[LIFECYCLE_DATA_TO_STORE]({ store, renderProps, ctx })
            // component[LIFECYCLE_DATA_TO_STORE] = undefined
            if (Array.isArray(thisTask)) {
                tasks = tasks.concat(thisTask)
            } else if (thisTask instanceof Promise || thisTask.then) {
                tasks.push(thisTask)
            } else if (typeof thisTask === 'function') {
                tasks.push(new Promise(async resolve => {
                    await thisTask()
                    resolve()
                }))
            }
        } else if (component.WrappedComponent) {
            extractDataToStoreTask(component.WrappedComponent)
        }
    }

    const extracHtmlExtendTask = (component) => {
        if (!component) return
        if (typeof component[LIFECYCLE_HTML_EXTEND] === 'function') {
            extendHtml = component[LIFECYCLE_HTML_EXTEND]
            // component[LIFECYCLE_HTML_EXTEND] = undefined
        } else if (component.WrappedComponent) {
            extracHtmlExtendTask(component.WrappedComponent)
        }
    }

    /** 
     * _服务器端_
     * 遍历同构渲染对象，执行其中对应的静态方法，并标记
     */
    if (__SERVER__) {
        // const connectedComponents = (() => {
        //     const {
        //         connectedComponents = []
        //     } = __DEV__ ? global.__KOOT_SSR__ : __KOOT_SSR__

        //     if (__DEV__) {
        //         if (!global.__KOOT_SSR_DEV_CONNECTED_COMPONENTS__)
        //             global.__KOOT_SSR_DEV_CONNECTED_COMPONENTS__ = new Map()

        //         const CTX = JSON.stringify(ctx)

        //         if (global.__KOOT_SSR_DEV_CONNECTED_COMPONENTS__.has(CTX))
        //             return global.__KOOT_SSR_DEV_CONNECTED_COMPONENTS__.get(CTX)

        //         global.__KOOT_SSR_DEV_CONNECTED_COMPONENTS__.set(CTX, connectedComponents)
        //     }

        //     return connectedComponents
        // })()
        const {
            connectedComponents = []
        } = __DEV__ ? global.__KOOT_SSR__ : __KOOT_SSR__
        connectedComponents.forEach(component => {
            extractDataToStoreTask(component)
        })
        // console.log('\n\n==========')
        // console.log({ connectedComponents, renderProps })
        // console.log('==========\n\n')
    }

    for (const component of renderProps.components) {
        /**
         * @type {Component}
         * 当前组件
         * component.WrappedComponent 是 redux 装饰的外壳
         */
        // const thisComponent = component && component.WrappedComponent ? component.WrappedComponent : component
        // extractDataToStoreTask(component)
        extracHtmlExtendTask(component)
    }

    // 等待所有异步方法执行完毕
    await Promise.all(tasks)

    // 扩展 HTML 相关信息
    const result = {
        title: process.env.KOOT_PROJECT_NAME || '',
        metaHtml: '',
        reduxHtml: `window.__REDUX_STATE__ = ${JSON.stringify(store.getState())};`
    }
    if (typeof extendHtml === 'function') {
        const {
            title: thisTitle,
            metas: thisMetas,
        } = extendHtml({ store, renderProps, ctx })

        result.title = thisTitle
        if (Array.isArray(thisMetas))
            result.metaHtml = thisMetas.map((meta) => (
                '<meta'
                + Object.keys(meta).map(key => ` ${key}="${meta[key]}"`).join('')
                + '>'
            )).join('')
    }

    return result
}

export default executeComponentLifecycle
