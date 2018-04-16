export default class HTMLExtendTool {

    constructor() {
        this.title = ''
        this.metas = []
    }

    setTitle(title) {
        this.title = title
    }

    addMeta(meta) {
        this.metas.push(meta)
    }
}