const fs = require('fs-extra')
const path = require('path')

const defaultValues = require('../../defaults/koot-config')

/**
 * 为空项添加默认值
 * @async
 * @param {String} projectDir
 * @param {Object} config
 * @returns {Object}
 */
module.exports = async (projectDir, config) => {

    Object.keys(defaultValues).forEach(key => {
        if (!config[key]) config[key] = defaultValues[key]
    })

    if (!config.name) {
        const filePackageJson = path.resolve(projectDir, 'package.json')
        if (fs.existsSync(filePackageJson)) {
            config.name = require(filePackageJson).name
        }
    }

    if (!config.webpackConfig) {
        config.webpackConfig = (() => {
            if (process.env.WEBPACK_BUILD_ENV === 'dev')
                return {}
            return {
                entry: {
                    commons: [
                        'react',
                        'react-dom',
                        'redux',
                        'redux-thunk',
                        'react-redux',
                        'react-router',
                        'react-router-redux',
                    ]
                },
                optimization: {
                    splitChunks: {
                        cacheGroups: {
                            commons: {
                                name: "commons",
                                chunks: "initial",
                                minChunks: 2
                            }
                        }
                    }
                }
            }
        })()
    }
}
