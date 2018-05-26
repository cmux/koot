class DevServerAfter {
    constructor(after) {
        this.after = after
    }

    apply(compiler) {
        const after = this.after
        compiler.hooks.done.tapAsync.bind(compiler.hooks.done, 'DevServerAfter')((compilation, callback) => {
            if (typeof after === 'function')
                after()

            callback()
        })
    }
}

module.exports = DevServerAfter
