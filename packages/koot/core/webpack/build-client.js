const webpack = require('webpack')
const {
    keyConfigWebpackSPATemplateInject,
} = require('../../defaults/before-build')

/**
 * 执行打包: client
 * @async
 * @param {Object} config
 * @returns {Promise}
 */
const webpackBuildClient = async (config = {}) => {

    delete config[keyConfigWebpackSPATemplateInject]

    const compiler = webpack(config)
    // console.log('compiler')

    return new Promise((resolve, reject) => {
        try {
            compiler.run(resolve)
        } catch (err) {
            reject(err)
        }
    })

}

module.exports = webpackBuildClient
