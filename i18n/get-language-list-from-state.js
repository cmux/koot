/**
 * 从当前的 Redux state 中获取语言列表字符串
 * 如果 uri search 中存在 fb_locale，将该值放在第一位
 * 
 * @param {object} state 当前的 Redux state
 * 
 * @returns {string} 语言列表，使用分号(;)分割
 */
export const getLanguagelistFromState = ({
    server = {},
    routing
}) => {
    const fb_locale = (
        routing &&
        routing.locationBeforeTransitions &&
        routing.locationBeforeTransitions.query
    ) ? routing.locationBeforeTransitions.query.fb_locale : null

    let lang = server.lang
    if (fb_locale) lang = fb_locale + ';' + lang

    return lang || ''
}

export default getLanguagelistFromState
