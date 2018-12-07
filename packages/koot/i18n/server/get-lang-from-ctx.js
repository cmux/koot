import cookie from 'cookie'
import { changeLocaleQueryKey } from '../../defaults/defines'
import getLocaleIds from '../get-locale-ids'
import parseLocaleId from '../parse-locale-id'

/**
 * 根据 KOA Context 获取语种ID
 * @param {Object} ctx KOA Context
 * @returns {String} 匹配到的或当前项目默认语种ID
 */
const getLangFromCtx = (ctx) => {
    if (!JSON.parse(process.env.KOOT_I18N))
        return ''

    const localeIds = getLocaleIds()

    // 根据项目设置，从 URL 中抽取语种 ID
    if (process.env.KOOT_I18N_URL_USE === 'router') {
        let pathname = ctx.path
        if (pathname.substr(0, 1) === '/') pathname = pathname.substr(1)
        pathname = pathname.split('/')
        if (localeIds.includes(pathname[0]))
            return pathname[0]
    } else {
        if (ctx.query[changeLocaleQueryKey])
            return ctx.query[changeLocaleQueryKey]
    }

    // 如果上一步没有结果，从 COOKIE 中获取
    const cookies = cookie.parse(ctx.request.header.cookie || '')
    if (cookies[process.env.KOOT_I18N_COOKIE_KEY] && cookies[process.env.KOOT_I18N_COOKIE_KEY] !== 'null')
        return cookies[process.env.KOOT_I18N_COOKIE_KEY]

    // 如果上一步没有结果，从请求 headers 中获取
    if (ctx.header['accept-language']) {
        // const acceptLanguage = ctx.header['accept-language']
        // const acceptLanguages = acceptLanguage.split(',').map(str => str.split(';')[0])
        // console.log('acceptLanguage', acceptLanguage)
        // console.log('acceptLanguages', acceptLanguages)
        // console.log('locale', parseLocaleId(acceptLanguage))
        return parseLocaleId(ctx.header['accept-language'])
    }

    // 如果上一步没有结果，返回项目默认语种
    return localeIds[0]
}

export default getLangFromCtx
