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

export default class HTMLExtendTool {

    constructor() {
        this.title = ''
        this.metas = []
    }

    setTitle(title) {
        this.title = title
    }

    getTitle() {
        return this.title
    }

    addMeta(meta) {
        this.metas.push(meta)
    }

    getMetaHtml() {
        return this.metas.map((meta) => {
            let str = '<meta'
            for (var key in meta) {
                str += ` ${key}="${meta[key]}"`
            }
            str += '>'
            return str
        }).join('')
    }

    getReduxScript(store) {
        return `<script>;window.__REDUX_STATE__ = ${JSON.stringify(store.getState())};</script>`)
    }

    convertToFullHtml(template = DEFAULT_TEMPLATE, inject = {}) {
        let html = template
        for (let key in inject) {
            html = html.replace(`<script>//inject_${key}</script>`, inject[key])
        }
        return html
    }
}