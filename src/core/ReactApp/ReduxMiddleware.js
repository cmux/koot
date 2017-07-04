/**
 * redux 中间件管理
 * 
 * @export
 * @class ReduxMiddleware
 */
export default class ReduxMiddleware {

    constructor() {
        this.middlewares = []
    }

    use(middleware) {
        this.middlewares.push(middleware)
    }

    get() {
        return this.middlewares
    }

}