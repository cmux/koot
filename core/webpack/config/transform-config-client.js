const path = require('path')
const DefaultWebpackConfig = require('webpack-config').default

const CopyWebpackPlugin = require('copy-webpack-plugin')
const KootI18nPlugin = require('../plugins/i18n')
const DevServerAfterPlugin = require('../plugins/dev-server-after')
const SpaTemplatePlugin = require('../plugins/spa-template')
const GenerateChunkmapPlugin = require('../plugins/generate-chunkmap')

const createTargetDefaultConfig = require('./create-target-default')
const transformConfigExtendDefault = require('./transform-config-extend-default')
const transformConfigLast = require('./transform-config-last')

const getCwd = require('../../../utils/get-cwd')

/**
 * Webpack 配置处理 - 客户端配置
 * @async
 * @param {Object} data 
 * @returns {Object} 处理后的配置
 */
module.exports = async (data = {}) => {
    const {
        config,
        appType,
        i18n,
        dist,
        inject,
        defaultPublicDirName, defaultPublicPathname,
        afterBuild = () => { },
        staticAssets,
    } = data

    const defaultClientEntry = path.resolve(
        __dirname,
        '../../../',
        appType,
        './client'
    )

    const pathPublic = path.resolve(dist, `public`)

    const getWebpackConfig = async () => {
        if (typeof i18n === 'object') {
            const {
                type = 'default'
            } = i18n
            switch (type) {
                case 'redux': {
                    return await handleSingleConfig()
                }
                default: {
                    const configs = []
                    for (let arr of i18n.locales) {
                        const thisConfig = await handleSingleConfig(arr[0], arr[1])
                        configs.push(thisConfig)
                    }
                    return configs
                }
            }
        } else {
            return await handleSingleConfig()
        }
    }

    let index = 0
    const handleSingleConfig = async (localeId, localesObj) => {
        const {
            WEBPACK_BUILD_TYPE: TYPE,
            WEBPACK_BUILD_ENV: ENV,
            WEBPACK_BUILD_STAGE: STAGE,
            WEBPACK_DEV_SERVER_PORT: clientDevServerPort,
        } = process.env

        const isSeperateLocale = localeId && typeof localesObj === 'object'

        const configTargetDefault = await createTargetDefaultConfig({
            pathRun: getCwd(),
            clientDevServerPort,
            localeId,
            /*APP_KEY: appName */
        })

        const thisConfig = new DefaultWebpackConfig()
            .merge(config)

        // 跟进打包环境和用户自定义配置，扩展webpack配置
        if (thisConfig.__ext) {
            thisConfig.merge(thisConfig.__ext[ENV])
        }

        // 如果自定义了，则清除默认
        if (thisConfig.entry) delete configTargetDefault.entry
        if (thisConfig.output) delete configTargetDefault.output

        const result = new DefaultWebpackConfig()
            .merge(configTargetDefault)
            .merge(await transformConfigExtendDefault(thisConfig, data))

        { // 处理 output
            // if (TYPE === 'spa') {
            //     result.output = configTargetDefault.output
            // }
            if (typeof result.output !== 'object')
                result.output = {}
            if (!result.output.path) {
                result.output.path = path.resolve(pathPublic, defaultPublicDirName)
                result.output.publicPath = defaultPublicPathname
            }
            if (!result.output.publicPath) {
                result.output.publicPath = defaultPublicPathname
            }
            const outputPathLastCharacter = result.output.publicPath.substr(result.output.publicPath.length - 1)
            if (outputPathLastCharacter !== '/' || outputPathLastCharacter !== '\\') {
                result.output.publicPath += '/'
            }
        }

        { // 处理 entry
            if (typeof result.entry === 'object' && !result.entry.client) {
                result.entry.client = defaultClientEntry
            } else if (typeof result.entry !== 'object') {
                result.entry = {
                    client: defaultClientEntry
                }
            }
        }

        { // 添加默认插件
            result.plugins.unshift(
                new KootI18nPlugin({
                    stage: STAGE,
                    functionName: i18n ? i18n.expr : undefined,
                    localeId: i18n ? (isSeperateLocale ? localeId : undefined) : undefined,
                    locales: i18n ? (isSeperateLocale ? localesObj : undefined) : undefined,
                })
            )
            if (ENV === 'dev')
                result.plugins.push(
                    new DevServerAfterPlugin(afterBuild)
                )

            if (TYPE === 'spa')
                result.plugins.push(
                    new SpaTemplatePlugin({
                        localeId: isSeperateLocale ? localeId : undefined,
                        inject,
                    })
                )
            else
                result.plugins.push(
                    await new GenerateChunkmapPlugin({
                        localeId: isSeperateLocale ? localeId : undefined,
                    })
                )

            if (typeof staticAssets === 'string' && !index)
                result.plugins.push(new CopyWebpackPlugin([
                    {
                        from: staticAssets,
                        to: path.relative(result.output.path, pathPublic)
                    }
                ]))
        }

        index++

        return await transformConfigLast(result)
    }

    return await getWebpackConfig()
}
