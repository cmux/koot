const opn = require('opn')

const getPort = require('../../../utils/get-port')

let opened = false

class DevServerAfter {
    constructor(after) {
        this.after = after
    }

    apply(compiler) {
        const after = this.after
        const TYPE = process.env.WEBPACK_BUILD_TYPE

        // hook: done
        // 执行 after 回调，并打开浏览器窗口
        compiler.hooks.done.tapAsync.bind(compiler.hooks.done, 'DevServerAfter')((compilation, callback) => {
            if (typeof after === 'function') after()
            console.log('\n')

            if (TYPE === 'spa') {
                if (!opened) opn(`http://localhost:${getPort()}/`)
                opened = true
            }

            callback()
        })
    }
}

module.exports = DevServerAfter
