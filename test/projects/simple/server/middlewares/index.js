import mountKoaStatic from './koa-static'
import mountKoaBody from './koa-body'
import mountKoaViews from './koa-views'

export function beforeMount(app) {
    mountKoaStatic(app)
}

export function afterMount(app) {
    mountKoaBody(app)
    mountKoaViews(app)
}