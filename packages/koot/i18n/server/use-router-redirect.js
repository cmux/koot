import getLocaleIds from '../get-locale-ids'
import getLangFromCtx from './get-lang-from-ctx'

/**
 * URL 使用 router 方式时，在同构中间件流程的匹配 react 路由之前，检查是否需要跳转
 * 如果需要跳转，此时发送跳转请求
 * @param {Object} ctx 
 * @returns {Boolean} 是否进行跳转
 */
const useRouterRedirect = (ctx) => {
    if (!JSON.parse(process.env.KOOT_I18N))
        return false

    if (process.env.KOOT_I18N_URL_USE !== 'router')
        return false

    let pathname = ctx.path
    if (pathname.substr(0, 1) === '/') pathname = pathname.substr(1)
    pathname = pathname.split('/')

    if (!getLocaleIds().includes(pathname[0])) {
        const lang = getLangFromCtx(ctx)

        // console.log('lang', lang)
        // console.log('pathname', pathname)

        pathname.unshift(lang)
        pathname = '/' + pathname.join('/')

        // 生成跳转后的地址
        const newpath = ctx.origin
            + ctx.href
                .replace(new RegExp(`^${ctx.origin}`), '')
                .replace(new RegExp(`^${ctx.path}`), pathname)

        // console.log('newpath', newpath)
        ctx.redirect(newpath)
        return true
    }

    return false
}

export default useRouterRedirect
