const ora = require('ora')
const spinners = require('cli-spinners')

module.exports = (options = {}) =>
    ora(
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