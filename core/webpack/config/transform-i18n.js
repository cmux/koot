const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')

const log = require('../../../libs/log')

/**
 * 处理 i18n 配置
 * @async
 * @param {*} i18n
 * @return {Boolean|Object}
 */
module.exports = async (i18n) => {
    const {
        WEBPACK_BUILD_TYPE: TYPE,
        WEBPACK_BUILD_ENV: ENV,
        WEBPACK_BUILD_STAGE: STAGE,
        // WEBPACK_ANALYZE,
        WEBPACK_DEV_SERVER_PORT: CLIENT_DEV_PORT,
        // SERVER_DOMAIN,
        // SERVER_PORT,
    } = process.env

    if (TYPE === 'spa') {
        // SPA：临时禁用
        i18n = false
        process.env.KOOT_I18N = JSON.stringify(false)
        if (STAGE === 'client')
            log('error', 'build',
                `i18n temporarily ` + chalk.redBright(`disabled`) + ` for `
                + chalk.cyanBright('SPA')
            )
        return i18n
    }

    if (typeof i18n === 'object') {
        let type = (() => {
            if (TYPE === 'spa') return 'redux'
            if (ENV === 'dev') return 'redux'
            return 'default'
        })()
        let expr = '__'
        let locales
        let cookieKey
        let domain

        if (Array.isArray(i18n)) {
            locales = [...i18n]
        } else {
            type = i18n.type || type
            expr = i18n.expr || expr
            locales = [...i18n.locales || []]
            cookieKey = i18n.cookieKey || cookieKey
            domain = i18n.domain || domain || undefined
        }

        if (ENV === 'dev') type = 'redux'
        if (type.toLowerCase() === 'store') type = 'redux'
        type = type.toLowerCase()

        if (STAGE === 'client') {
            log('success', 'build',
                `i18n ` + chalk.yellowBright(`enabled`)
            )
            console.log(`  > type: ${chalk.yellowBright(type)}`)
            console.log(`  > locales: ${locales.map(arr => arr[0]).join(', ')}`)
        }

        locales.forEach(arr => {
            if (arr[2]) return
            const pathname = path.resolve(process.cwd(), arr[1])
            arr[1] = fs.readJsonSync(pathname)
            arr[2] = pathname
        })

        process.env.KOOT_I18N = JSON.stringify(true)
        process.env.KOOT_I18N_TYPE = JSON.stringify(type)
        process.env.KOOT_I18N_LOCALES = JSON.stringify(locales)
        if (cookieKey) process.env.KOOT_I18N_COOKIE_KEY = cookieKey
        if (domain) process.env.KOOT_I18N_COOKIE_DOMAIN = domain

        i18n = {
            type,
            expr,
            locales,
        }

        if (ENV === 'dev' && type === 'default') {
            console.log(`  > We recommend using ${chalk.greenBright('redux')} mode in DEV enviroment.`)
        }

        return i18n
    }

    i18n = false
    process.env.KOOT_I18N = JSON.stringify(false)
    return i18n
}
