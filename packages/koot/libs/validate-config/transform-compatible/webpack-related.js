/**
 * 配置转换 - 兼容性处理 - Webpack 相关选项
 * - aliases
 * - defines
 * - webpackConfig
 * - webpackBefore
 * - webpackAfter
 * - moduleCssFilenameTest
 * - internalLoaderOptions
 * - devDll
 * - devHmr
 * @async
 * @param {Object} config
 * @void
 */
module.exports = async (config) => {

    if (typeof config.moduleCssFilenameTest !== 'undefined') {
        delete config.css
    } else if (typeof config.css === 'object' &&
        typeof config.css.fileBasename === 'object' &&
        typeof config.css.fileBasename.component !== 'undefined'
    ) {
        config.moduleCssFilenameTest = config.css.fileBasename.component
        delete config.css
    }

    const transform = (key, keyInWebpack) => {
        if (typeof config[key] !== 'undefined' && typeof config.webpack === 'object') {
            delete config.webpack[keyInWebpack]
        } else if (typeof config.webpack === 'object') {
            config[key] = config.webpack[keyInWebpack]
            delete config.webpack[keyInWebpack]
        }
    }

    const keys = [
        ['aliases', 'aliases'],
        ['defines', 'defines'],
        ['webpackConfig', 'config'],
        ['webpackBefore', 'beforeBuild'],
        ['webpackAfter', 'afterBuild'],
        ['internalLoaderOptions', 'internalLoadersOptions'],
        ['devDll', 'dll'],
        ['devHmr', 'hmr'],
    ]

    keys.forEach(([key, keyInWebpack]) => transform(key, keyInWebpack))

    if (typeof config.classNameHashLength !== 'undefined') {
        if (isNaN(config.classNameHashLength)) {
            delete config.classNameHashLength
        } else {
            const r = parseInt(config.classNameHashLength)
            if (r <= 0)
                delete config.classNameHashLength
        }
    }

}
