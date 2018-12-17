import { CHANGE_LANGUAGE, TELL_CLIENT_URL, SYNC_COOKIE } from '../../../../action-types'
import i18nUseRouterRedirect from '../../../../../i18n/server/use-router-redirect'
import isI18nEnabled from '../../../../../i18n/is-enabled'
import i18nOnServerRender from '../../../../../i18n/onServerRender'
import validateI18n from '../../../validate/i18n'
import log from '../../../../../libs/log'

const beforeRouterMatch = async ({
    store, ctx, localeId, syncCookie, callback
}) => {
    // 如果 i18n URL 使用 router 方式同时判定需要跳转，此时进行处理
    const needRedirect = i18nUseRouterRedirect(ctx)
    if (needRedirect)
        return needRedirect

    // 告诉前端，当前的url是啥
    store.dispatch({ type: TELL_CLIENT_URL, data: ctx.origin })

    // 把http请求带来的cookie同步到ssr的初始化redux state里
    // server.cookie 获取
    // 配置信息在koot.config.js里
    // redux.syncCookie = ['token', 'sid'] | 'token' | false
    if (syncCookie) {
        let cookies = syncCookie
        const data = {}

        // 结构统一
        if (typeof cookies === 'string')
            cookies = [cookies]

        if (Array.isArray(cookies)) {
            // 获取需要的cookie值
            cookies.forEach(c => {
                data[c] = ctx.cookies.get(c)
            })
        } else if (cookies === true) {
            data.__ = ctx.headers.cookie || ''
            data.__.split(';').forEach(str => {
                const crumbs = str.split('=')
                if (crumbs.length > 1) {
                    data[crumbs[0].trim()] = crumbs[1].trim()
                }
            })
        }

        // 同步到state中
        store.dispatch({ type: SYNC_COOKIE, data })
    }

    if (isI18nEnabled()) {
        if (__DEV__) await validateI18n()
        store.dispatch({ type: CHANGE_LANGUAGE, data: localeId })
        i18nOnServerRender({ store })
    }

    if (__DEV__) log('callback', 'server', 'beforeRouterMatch')
    if (typeof callback === 'function')
        await callback({ store, ctx })
}

export default beforeRouterMatch
