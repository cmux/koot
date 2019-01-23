const ejs = require('ejs')

const readClientFile = require('../utils/read-client-file')
const getClientFilePath = require('../utils/get-client-file-path')

/**
 * 渲染 ejs 模板
 * @param {Object} options
 * @param {String} options.template ejs 模板内容
 * @param {Object} [options.inject={}] 注入对象
 * @param {Object} [options.state] 当前 Redux state。也可以传入 Redux store
 * @param {Object} [options.compilation] webpack compilation
 * @returns {String}
 */
module.exports = ({
    template = DEFAULT_TEMPLATE,
    inject = {},
    store, state,
    compilation,
}) => {

    if (typeof state !== 'object' && typeof store === 'object' && typeof store.getState === 'function')
        state = store.getState()
    else if (typeof state === 'object' && typeof state.getState === 'function')
        state = state.getState()

    try {
        for (let key in inject) {
            if (typeof inject[key] === 'function')
                inject[key] = inject[key](template, state)
        }
    } catch (e) {
        console.log(e)
    }

    // 开发环境: 将 content('critical.js') 转为 pathname() 方式
    if (process.env.WEBPACK_BUILD_ENV === 'dev')
        template = template
            .replace(
                /<script(.*?)><%(.*?)content\(['"]critical\.js['"]\)(.*?)%><\/script>/,
                `<script$1 src="<%$2pathname('critical.js')$3%>"></script>`
            )

    // console.log(template)

    const localeId = typeof state === 'object' ? state.localeId : undefined

    return ejs.render(
        template, {
            inject,
            content: (filename) => readClientFile(filename, localeId, compilation),
            pathname: (filename) => getClientFilePath(filename, localeId),
        }, {}
    )
}

const DEFAULT_TEMPLATE = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <script>//inject_meta</script>
        <title><script>//inject_title</script></title>
        <script>//inject_component_styles</script>
    </head>
    <body>
        <div id="root">
            <div><script>//inject_html</script></div>
        </div>
        <script>//inject_redux_state</script>
        <script>//inject_js</script>
    </body>
    </html>
`
