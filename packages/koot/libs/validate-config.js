const fs = require('fs-extra')
const path = require('path')

const validatePathname = require('./validate-pathname')
const validateConfigDist = require('./validate-config-dist')
// const validateAppType = require('../utils/get-app-type')
const getCwd = require('../utils/get-cwd')
const readBuildConfigFile = require('../utils/read-build-config-file')
// const getPathnameBuildConfigFile = require('../utils/get-pathname-build-config-file')
const {
    keyFileProjectConfigTempFull,
    keyFileProjectConfigTempPortion,
    filenameProjectConfigTempFull,
    filenameProjectConfigTempPortion,
    propertiesToExtract: _propertiesToExtract,
    dirConfigTemp: _dirConfigTemp,
    typesSPA,
} = require('../defaults/before-build')

/**
 * 根据 koot.config.js 生成 koot.js 和打包配置对象
 * 
 * **以下内容写入环境变量**
 * - `KOOT_PROJECT_CONFIG_FULL_PATHNAME` 项目配置文件路径，包含所有需要引用的内容 (临时使用)
 * - `KOOT_PROJECT_CONFIG_PORTION_PATHNAME` 项目配置文件路径，包含部分需要引用的内容 (临时使用)
 * 
 * **兼容情况** * 
 * - _0.8_: 当前版本
 * - _0.6_: 完全兼容
 * - _更早期_: 已放弃兼容
 * 
 * @async
 * @param {String} [projectDir] 项目根目录
 * @param {Object} [options={}]
 * @param {String} [options.configFilename=koot.config.js] 配置文件文件名
 * @param {String} [options.tmpDir] 存放临时文件的目录
 * @returns {Object} 打包配置对象
 */
module.exports = async (projectDir = getCwd(), options = {}) => {

    const {
        configFilename = 'koot.config.js',
        tmpDir
    } = options

    // const ENV = process.env.WEBPACK_BUILD_ENV

    /** @type {String} 完整配置文件路径名 */
    let fileFullConfig = typeof process.env.KOOT_BUILD_CONFIG_PATHNAME === 'string'
        ? process.env.KOOT_BUILD_CONFIG_PATHNAME
        : path.resolve(projectDir, configFilename)

    // 如果完整配置文件不存在，转为旧模式 (koot.js + koot.build.js)
    if (!fs.existsSync(fileFullConfig)) {
        const buildConfig = await readBuildConfigFile()
        return validateBuildConfig(buildConfig)
    }

    /** @type {Object} 完整配置 */
    const fullConfig = { ...require(fileFullConfig) }

    /** @type {Boolean} 是否定制了项目配置文件路径名 */
    const isCustomProjectConfig = typeof process.env.KOOT_PROJECT_CONFIG_FULL_PATHNAME === 'string'

    /** @type {Array} 需要抽取到项目配置中的项 */
    const propertiesToExtract = [..._propertiesToExtract]

    // 目标文件是否是完整配置文件
    const isFullConfig = propertiesToExtract.some(([key]) => typeof fullConfig[key] !== 'undefined')

    // console.log({
    //     fileFullConfig,
    //     isCustomProjectConfig,
    //     fullConfig,
    // })

    if (isFullConfig) {

        const dirConfigTemp = tmpDir || path.resolve(projectDir, _dirConfigTemp)
        await fs.ensureDir(dirConfigTemp)

        /** @type {Boolean} 当前项目是否是 SPA */
        const isSPA = typesSPA.includes(fullConfig.type)

        if (isSPA) {
            // SPA 项目: 添加顶层项 inject
            propertiesToExtract.push(['inject', undefined])

            // SPA 项目: 如果配置顶层没有 inject 同时 server.inject 存在值，将 server.inject 移至顶层
            if (!fullConfig.inject &&
                typeof fullConfig.server === 'object' &&
                typeof fullConfig.server.inject !== 'undefined'
            ) {
                fullConfig.inject = fullConfig.server.inject
            }
        } else {
            // 同构项目: 如果配置顶层有 inject 同时 server.inject 没有值，将 inject 移至顶层 server.inject
            if (!!fullConfig.inject &&
                typeof fullConfig.server === 'object' &&
                !fullConfig.server.inject
            ) {
                fullConfig.inject.server = fullConfig.inject
                delete fullConfig.inject
            }
        }

        // 项目配置
        const projectConfigFull = {}
        const projectConfigPortion = {}
        const propertiesPortion = [
            'template',
            'redux',
            'server'
        ]

        // 将打包配置从完整配置中分离
        const buildConfig = propertiesToExtract.reduce((configRemains, curr) => {
            // console.log(configRemains)
            const [key, defaultValue] = curr
            const value = configRemains[key] || defaultValue
            projectConfigFull[key] = typeof value === 'object' ? { ...value } : value
            if (propertiesPortion.includes(key))
                projectConfigPortion[key] = typeof value === 'object' ? { ...value } : value
            delete configRemains[key]
            return configRemains
        }, fullConfig)

        delete projectConfigPortion.server.onRender

        // 如果定制了配置文件路径，直接返回结果
        if (isCustomProjectConfig) {
            return {
                ...validateBuildConfig(buildConfig),
                [keyFileProjectConfigTempFull]: process.env.KOOT_PROJECT_CONFIG_FULL_PATHNAME,
                [keyFileProjectConfigTempPortion]: process.env.KOOT_PROJECT_CONFIG_PORTION_PATHNAME
            }
        }

        // const {
        //     name,
        //     type,
        //     template,
        //     router,
        //     redux = {},
        //     client = {},
        //     server = {},
        //     ...buildConfig
        // } = require(fileFullConfig)

        // 转换项目配置: 将路径转为 require()
        const evalValue = (objectName, key) => {
            try {
                if (eval(`typeof ${objectName}.${key} === 'string'`)) {
                    const value = eval(`${objectName}.${key}`)
                    const pathname = path.isAbsolute(value)
                        ? value
                        : validatePathname(value, projectDir).replace(/\\/g, '\\\\')
                    const result = path.isAbsolute(pathname)
                        ? pathname
                        : ('../../../' + pathname.replace(/^\.\//, ''))
                    eval(`${objectName}.${key} = \`require('${result}').default\``)
                }
            } catch (e) { }
        }
        const validateProjectConfig = (keys) => {
            keys.forEach(key => {
                evalValue('projectConfigFull', key)
                evalValue('projectConfigPortion', key)
            })
        }
        validateProjectConfig([
            'router',
            'redux.combineReducers',
            'redux.store',
            'client.before',
            'client.after',
            'client.onRouterUpdate',
            'client.onHistoryUpdate',
            'server.reducers',
            'server.inject',
            'server.before',
            'server.after',
            'server.onRender',
            'server.onRender.beforeDataToStore',
            'server.onRender.afterDataToStore',
            'inject',
        ])

        // console.log(projectConfigFull)
        // 生成项目配置文件内容
        const tempFull = propertiesToExtract.map(([key]) => {
            let result = ''
            if (key === 'server') {
                if (isSPA) return ''
                result = `export const ${key} = __SERVER__ ? ${JSON.stringify(projectConfigFull[key])} : {};`
            } else {
                result = `export const ${key} = ${JSON.stringify(projectConfigFull[key])};`
            }
            return result
        })
            .join('\n')
            .replace(/"require\((.+?)\).default"/g, `require($1).default`)

        const tempPortion = propertiesPortion.map((key) => {
            let result = ''
            if (key === 'server') {
                if (isSPA) return ''
                result = `export const ${key} = __SERVER__ ? ${JSON.stringify(projectConfigPortion[key])} : {};`
            } else {
                result = `export const ${key} = ${JSON.stringify(projectConfigPortion[key])};`
            }
            return result
        })
            .join('\n')
            .replace(/"require\((.+?)\).default"/g, `require($1).default`)

        // console.log(tempFull)

        // 写入项目配置文件 (临时)
        const pathFull = path.resolve(dirConfigTemp, filenameProjectConfigTempFull.replace(/\*/g, Date.now()))
        process.env.KOOT_PROJECT_CONFIG_FULL_PATHNAME = pathFull
        await fs.writeFile(pathFull, tempFull, 'utf-8')

        const pathPortion = path.resolve(dirConfigTemp, filenameProjectConfigTempPortion.replace(/\*/g, Date.now()))
        process.env.KOOT_PROJECT_CONFIG_PORTION_PATHNAME = pathPortion
        await fs.writeFile(pathPortion, tempPortion, 'utf-8')

        return {
            ...validateBuildConfig(buildConfig),
            [keyFileProjectConfigTempFull]: pathFull,
            [keyFileProjectConfigTempPortion]: pathPortion
        }

    } else {
        // 非完整配置情况，为兼容旧版本 (< 0.6) 而设
        const buildConfig = await readBuildConfigFile()
        return validateBuildConfig(buildConfig)
    }
}

// 调整构建配置对象
const validateBuildConfig = (config = {}) => {

    // 改变配置项: dest -> dist
    if (typeof config.dest !== 'undefined') {
        config.dist = config.dest
        delete config.dest
    }
    if (typeof config.dist !== 'undefined') {
        validateConfigDist(config.dist)
    }

    // 改变配置项: webpack.config -> config
    if (typeof config.webpack === 'object') {
        /**
         * 将配置中的 webpack 对象内的内容应用到配置对象顶层
         * @param {String} nameInObject 
         * @param {String} nameAfter 
         */
        const applyWebpackConfig = (nameInObject, nameAfter) => {
            if (typeof config.webpack[nameInObject] !== 'undefined') {
                config[nameAfter] = config.webpack[nameInObject]
                delete config.webpack[nameInObject]
            }
        }
        applyWebpackConfig('config', 'config')
        applyWebpackConfig('beforeBuild', 'beforeBuild')
        applyWebpackConfig('afterBuild', 'afterBuild')
        applyWebpackConfig('defines', 'defines')
        applyWebpackConfig('dll', 'webpackDll')
        applyWebpackConfig('hmr', 'webpackHmr')
        applyWebpackConfig('compilerHook', 'webpackCompilerHook')
        Object.keys(config.webpack).forEach(key => {
            applyWebpackConfig(key, 'webpack' + key.substr(0, 1).toUpperCase() + key.substr(1))
        })
        delete config.webpack
    }

    return config
}
