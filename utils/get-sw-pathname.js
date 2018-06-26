// import { localeId } from '../i18n'

module.exports = (l) => {

    if (typeof process.env.SUPER_PWA_PATHNAME !== 'string')
        return ''

    const i18nType = JSON.parse(process.env.SUPER_I18N)
        ? JSON.parse(process.env.SUPER_I18N_TYPE)
        : undefined

    const pwaPathname = JSON.parse(process.env.SUPER_PWA_PATHNAME)

    if (i18nType !== 'default')
        return pwaPathname

    if (!l)
        return pwaPathname

    const chunks = pwaPathname.split('.')
    chunks.splice(chunks.length - 1, 0, l)
    return chunks.join('.')

}
