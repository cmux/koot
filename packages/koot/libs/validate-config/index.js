const fs = require('fs-extra')
const path = require('path')

const validatePathname = require('../validate-pathname')
const validateConfigDist = require('../validate-config-dist')
const getCwd = require('../../utils/get-cwd')
const {
    keyFileProjectConfigTempFull,
    keyFileProjectConfigTempPortion,
    filenameProjectConfigTempFull,
    filenameProjectConfigTempPortion,
    propertiesToExtract: _propertiesToExtract,
    dirConfigTemp: _dirConfigTemp,
    typesSPA,
} = require('../../defaults/before-build')
const log = require('../../libs/log')
const __ = require('../../utils/translate')

/**
 * 根据 koot.config.js 生成 koot.js 和打包配置对象
 * 
 * 根据以下优先级查找配置文件
 * 1. `process.env.KOOT_BUILD_CONFIG_PATHNAME`
 * 2. 项目根目录下指定的文件
 * 2. 项目根目录下的 `koot.config.js`
 * 
 * 以下内容写入环境变量
 * - `KOOT_PROJECT_CONFIG_FULL_PATHNAME` 项目配置文件路径，包含所有需要引用的内容 (临时使用)
 * - `KOOT_PROJECT_CONFIG_PORTION_PATHNAME` 项目配置文件路径，包含部分需要引用的内容 (临时使用)
 * 
 * 兼容情况
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
const validateConfig = async (projectDir = getCwd(), options = {}) => {

    const {
        configFilename = 'koot.config.js',
        tmpDir
    } = options

    /** @type {String} 配置文件路径名 */
    let fileConfig = typeof process.env.KOOT_BUILD_CONFIG_PATHNAME === 'string'
        ? process.env.KOOT_BUILD_CONFIG_PATHNAME
        : path.resolve(projectDir, configFilename)

    // 如果完整配置文件不存在，报错，结束流程
    if (!fs.existsSync(fileConfig)) {
        const msg = __('validateConfig.error.config_file_not_found')
        log('error', '', msg)
        throw new Error(msg)
    }

    /** @type {Object} 完整配置 */
    const fullConfig = { ...require(fileConfig) }

    /** @type {Array} 需要抽取到项目配置中的项 */
    const propertiesToExtract = [..._propertiesToExtract]

    // 如果目标配置文件为旧版本，报错，结束流程
    if (!propertiesToExtract.some(([key]) => typeof fullConfig[key] !== 'undefined')) {
        const msg = __('validateConfig.error.config_file_old')
        log('error', '', msg)
        throw new Error(msg)
    }

    /** @type {String} 存放临时文件的目录 */
    const dirConfigTemp = tmpDir || path.resolve(projectDir, _dirConfigTemp)
    // 确保该临时目录存在
    await fs.ensureDir(dirConfigTemp)

    /** @type {Boolean} 当前项目是否是 SPA */
    const isSPA = typesSPA.includes(fullConfig.type)

    // 兼容性处理 (将老版本的配置转换为最新配置)
    await require('./transform-compatible/template-inject')(fullConfig)
    await require('./transform-compatible/router-related')(fullConfig)
    await require('./transform-compatible/redux-related')(fullConfig)
    await require('./transform-compatible/static-copy-from')(fullConfig)
    await require('./transform-compatible/client-related')(fullConfig)
    await require('./transform-compatible/server-related')(fullConfig)
    await require('./transform-compatible/webpack-related')(fullConfig)

    // 清理所有第一级的 undefined 项和空对象
    // 清理所有第一级的空对象
    Object.keys(fullConfig).forEach(key => {
        if (typeof fullConfig[key] === 'undefined')
            delete fullConfig[key]
        // if (Array.isArray(fullConfig[key]) && !fullConfig[key].length)
        //     delete fullConfig[key]
        if (typeof fullConfig[key] === 'object' &&
            !Array.isArray(fullConfig[key]) &&
            !(fullConfig[key] instanceof RegExp) &&
            !Object.keys(fullConfig[key]).length
        )
            delete fullConfig[key]
    })

    // 处理默认值
    await require('./add-default-values')(projectDir, fullConfig)

    // 代码中引用的配置文件 (存放于临时目录中)
    const { tmpConfig, tmpConfigPortion } = await require('./extract-to-tmp')(fullConfig)

    return {
        fullConfig,
        tmpConfig,
        tmpConfigPortion
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
    if (typeof process.env.KOOT_PROJECT_CONFIG_FULL_PATHNAME === 'string') {
        return {
            ...finalValidate(buildConfig),
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
    // } = require(fileConfig)

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
        ...finalValidate(buildConfig),
        [keyFileProjectConfigTempFull]: pathFull,
        [keyFileProjectConfigTempPortion]: pathPortion
    }
}

// 调整构建配置对象
const finalValidate = (config = {}) => {

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

module.exports = validateConfig
