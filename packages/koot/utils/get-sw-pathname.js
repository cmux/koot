/**
 * 获取 service-worker 文件名
 * @param {String} [localeId] 如果提供，则会返回 [NAME].[localeId].js
 * @returns {String}
 */
module.exports = (localeId) => {

    if (typeof process.env.KOOT_PWA_PATHNAME !== 'string')
        return ''

    const i18nType = JSON.parse(process.env.KOOT_I18N)
        ? JSON.parse(process.env.KOOT_I18N_TYPE)
        : undefined

    const pwaPathname = JSON.parse(process.env.KOOT_PWA_PATHNAME)

    if (i18nType !== 'default')
        return pwaPathname

    if (!localeId)
        return pwaPathname

    const chunks = pwaPathname.split('.')
    chunks.splice(chunks.length - 1, 0, localeId)
    return chunks.join('.')

}
