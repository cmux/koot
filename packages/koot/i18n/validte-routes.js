import isI18nEnabled from './is-enabled';

/**
 * 根据当前项目配置，对路由对象进行改造
 * @param {Object} routes
 * @returns {Object} routes
 */
const validateRoutes = (routes = {}) => {
    if (!isI18nEnabled()) return routes;

    if (process.env.KOOT_I18N_URL_USE === 'router') {
        routes.path = `:localeId`;
        // console.log({ routes, use: process.env.KOOT_I18N_URL_USE });
        return routes;
    }

    return routes;
};

export default validateRoutes;
