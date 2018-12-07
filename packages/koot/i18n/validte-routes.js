import getLocaleIds from './get-locale-ids'

/**
 * 根据当前项目配置，对路由对象进行改造
 * @param {Object} routes 
 * @returns {Object} routes
 */
const validateRoutes = (routes = {}) => {
    if (!JSON.parse(process.env.KOOT_I18N))
        return routes

    if (process.env.KOOT_I18N_URL_USE === 'router') {
        return {
            name: 'koot-i18n-use-router-routes',
            childRoutes: getLocaleIds()
                .map(localeId => ({
                    path: localeId,
                    ...routes,
                }))
        }
    }

    return routes
}

export default validateRoutes
