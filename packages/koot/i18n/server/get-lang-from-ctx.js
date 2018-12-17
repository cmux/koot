// import cookie from 'cookie'
import { changeLocaleQueryKey } from '../../defaults/defines'
import getLocaleIds from '../get-locale-ids'
import parseLocaleId from '../parse-locale-id'
import setCookie from '../set-cookie'
import isI18nEnabled from '../is-enabled'

/**
 * 根据 KOA Context 获取语种ID
 * @param {Object} ctx KOA Context
 * @returns {String} 匹配到的或当前项目默认语种ID
 */
const getLangFromCtx = (ctx) => {
    if (!isI18nEnabled())
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
        if (ctx.query[changeLocaleQueryKey]) {
            if (localeIds.includes(ctx.query[changeLocaleQueryKey]))
                return ctx.query[changeLocaleQueryKey]
            ctx.redirect(ctx.url
                .replace(new RegExp(`(\\?|&)${changeLocaleQueryKey}=(.+)$`), '')
                .replace(new RegExp(`(\\?|&)${changeLocaleQueryKey}=(.+)&`), '')
            )
            return localeIds[0]
        }
    }

    // 如果上一步没有结果，从 COOKIE 中获取
    // const cookies = cookie.parse(ctx.request.header.cookie || '')
    // if (cookies[process.env.KOOT_I18N_COOKIE_KEY] && cookies[process.env.KOOT_I18N_COOKIE_KEY] !== 'null')
    //     return cookies[process.env.KOOT_I18N_COOKIE_KEY]
    const cookieValue = ctx.cookies.get(process.env.KOOT_I18N_COOKIE_KEY)
    if (cookieValue && localeIds.includes(cookieValue)) {
        return cookieValue
    }

    // console.log('ctx.cookies.get(process.env.KOOT_I18N_COOKIE_KEY)', cookieValue)
    // 如果上一步没有结果，从请求 headers 中获取
    if (ctx.header['accept-language']) {
        // const acceptLanguage = ctx.header['accept-language']
        // const acceptLanguages = acceptLanguage.split(',').map(str => str.split(';')[0])
        // console.log('acceptLanguage', acceptLanguage)
        // console.log('acceptLanguages', acceptLanguages)
        // console.log('parsed locale id', parseLocaleId(acceptLanguage))
        return setLocale(parseLocaleId(ctx.header['accept-language']), ctx)
    }

    // 如果上一步没有结果，返回项目默认语种
    return setLocale(localeIds[0], ctx)
}

export default getLangFromCtx

/**
 * 服务器环境: 设置 cookie
 * @param {*} localeId 
 */
const setLocale = (localeId, ctx) => {
    setCookie(localeId, ctx)
    return localeId
}
