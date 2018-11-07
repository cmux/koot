
const ora = require('ora')
const spinners = require('cli-spinners')

module.exports = (options = {}) => {
    const waiting = ora(
        Object.assign(
            {
                spinner: spinners.dots,
                color: 'cyan'
            },
            typeof options === 'string' ? {
                text: options
            } : options
        )
    ).start()

    // waiting.finish = (options = {}) => {
    //     waiting.color = 'green'
    //     waiting.stopAndPersist(Object.assign({
    //         symbol: '√'
    //     }, options))
    // }
    waiting.finish = waiting.succeed

    return waiting
}
