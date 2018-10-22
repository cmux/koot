const fs = require('fs-extra')
const path = require('path')

const validatePathname = require('./validate-pathname')
const getCwd = require('../utils/get-cwd')
const readBuildConfigFile = require('../utils/read-build-config-file')
// const getPathnameBuildConfigFile = require('../utils/get-pathname-build-config-file')
const { keyFileProjectConfigTemp } = require('../defaults/before-build')

/**
 * 根据 koot.config.js 生成 koot.js 和构建配置对象
 * @returns {Object} 构建配置对象
 */
module.exports = async (projectDir = getCwd()) => {

    let fileFullConfig = typeof process.env.KOOT_BUILD_CONFIG_PATHNAME === 'string'
        ? process.env.KOOT_BUILD_CONFIG_PATHNAME
        : path.resolve(projectDir, 'koot.config.js')

    if (!fs.existsSync(fileFullConfig)) {
        const buildConfig = await readBuildConfigFile()
        return validateBuildConfig(buildConfig)
    }

    const fullConfig = require(fileFullConfig)

    // 项目配置项
    let propertiesToExtract = [
        ['name', ''],
        ['type', 'react'],
        ['template', ''],
        ['router', ''],
        ['redux', {}],
        ['client', {}],
        ['server', {}]
    ]
    const projectConfig = {}

    // 目标文件是否是完整配置文件
    const isFullConfig = propertiesToExtract.some(([key]) => typeof fullConfig[key] !== 'undefined')

    if (isFullConfig) {

        const buildConfig = propertiesToExtract.reduce((configRemains, curr) => {
            // console.log(configRemains)
            const [key, defaultValue] = curr
            projectConfig[key] = configRemains[key] || defaultValue
            delete configRemains[key]
            return configRemains
        }, fullConfig)

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
        const validateProjectConfig = (keys) => {
            keys.forEach(key => {
                if (eval(`typeof projectConfig.${key} === 'string'`)) {
                    const pathname = validatePathname(eval(`projectConfig.${key}`), projectDir).replace(/\\/g, '\\\\')
                    eval(`projectConfig.${key} = \`require('${pathname}').default\``)
                }
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
        ])

        // console.log(projectConfig)
        const temp = propertiesToExtract.map(([key]) => (
            `export const ${key} = ${JSON.stringify(projectConfig[key])};`
                .replace(/"require\((.+?)\).default"/, `require($1).default`)
        )).join('\n')
        // console.log(temp)
        const pathTemp = path.resolve(projectDir, `.koot.project.config.${Date.now()}.js`)
        process.env.KOOT_PROJECT_CONFIG_PATHNAME = pathTemp
        await fs.writeFile(pathTemp, temp, 'utf-8')
        return {
            ...validateBuildConfig(buildConfig),
            [keyFileProjectConfigTemp]: pathTemp
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

    // 改变配置项: webpack.config -> config
    if (typeof config.webpack === 'object') {
        if (typeof config.webpack.config !== 'undefined') {
            config.config = config.webpack.config
            delete config.webpack.config
        }
        if (typeof config.webpack.beforeBuild !== 'undefined') {
            config.beforeBuild = config.webpack.beforeBuild
            delete config.webpack.beforeBuild
        }
        if (typeof config.webpack.afterBuild !== 'undefined') {
            config.afterBuild = config.webpack.afterBuild
            delete config.webpack.afterBuild
        }
        if (typeof config.webpack.defines !== 'undefined') {
            config.defines = config.webpack.defines
            delete config.webpack.defines
        }
        delete config.webpack
    }

    return config
}
