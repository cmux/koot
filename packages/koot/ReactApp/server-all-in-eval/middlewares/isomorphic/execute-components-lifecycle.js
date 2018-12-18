/** @type {String} 同步数据到 store 的静态方法名 */
const LIFECYCLE_DATA_TO_STOER = 'onServerRenderStoreExtend'
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

    for (const component of renderProps.components) {
        /**
         * @type {Component}
         * 当前组件
         * component.WrappedComponent 是 redux 装饰的外壳
         */
        const thisComponent = component && component.WrappedComponent ? component.WrappedComponent : component
        if (thisComponent) {
            if (typeof thisComponent[LIFECYCLE_DATA_TO_STOER] === 'function') {
                const thisTask = thisComponent[LIFECYCLE_DATA_TO_STOER]({ store, renderProps, ctx })
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
            }
            if (typeof thisComponent[LIFECYCLE_HTML_EXTEND] === 'function') {
                extendHtml = thisComponent[LIFECYCLE_HTML_EXTEND]
            }
        }
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
                + Object.keys(meta).map(key => ` ${key}="${meta[key]}"`)
                + '>'
            )).join('')
    }

    return result
}

export default executeComponentLifecycle
