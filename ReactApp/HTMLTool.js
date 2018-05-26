export default class HTMLTool {

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
        return `window.__REDUX_STATE__ = ${JSON.stringify(store.getState())};`
    }

    // convertToFullHtml(template = DEFAULT_TEMPLATE, inject = {}) {
    //     let html = template
    //     for (let key in inject) {
    //         html = html.replace(`<script>//inject_${key}</script>`, inject[key])
    //     }
    //     return html
    // }
}
