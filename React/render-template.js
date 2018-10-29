const ejs = require('ejs')

import readClientFile from '../utils/read-client-file'
import getClientFilePath from '../utils/get-client-file-path'

/**
 * 渲染 ejs 模板
 * @param {String} template ejs 模板内容
 * @param {Object} inject 注入对象
 * @param {Object} [filemap] 文件对照表
 * @returns {String}
 */
export default (template = DEFAULT_TEMPLATE, inject = {}) => {
    try {
        for (let key in inject) {
            if (typeof inject[key] === 'function')
                inject[key] = inject[key](template)
        }
    } catch (e) {
        console.log(e)
    }

    // console.log(template)

    return ejs.render(
        template, {
            inject,
            content: readClientFile,
            pathname: getClientFilePath,
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
