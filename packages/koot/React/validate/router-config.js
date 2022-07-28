import errorMsg from '../../libs/error-msg';
import i18nValidateRoutes from '../../i18n/validte-routes';

/**
 * 验证 `react-router` 配置
 *
 * @param {Object} kootConfigRouter Koot 配置项: `router`
 * @returns {Promise<Object>} 路由配置对象，可直接供 `react-router` 使用
 */
const validateRouterConfig = (kootConfigRouter) =>
    getPromise(kootConfigRouter).then((config) => {
        if (typeof config !== 'object')
            throw new Error(
                errorMsg(
                    'VALIDATE_ROUTER_CONFIG',
                    'no router config or router object invalid'
                )
            );

        let { ...routes } = (() => {
            if (Array.isArray(config)) {
                return {
                    childRoutes: [...config],
                };
            }
            return config;
        })();

        if (!routes.path) {
            routes.path = '/';
        }

        handleIndexRoute(routes);
        i18nValidateRoutes(routes);

        if (
            process.env.KOOT_HISTORY_BASENAME &&
            (routes.path === '/' || !routes.path)
        ) {
            const newBase = process.env.KOOT_HISTORY_BASENAME.replace(
                /^\//,
                ''
            ).replace(/\/$/, '');
            if (!!process.env.KOOT_HISTORY_EXTRABASE) {
                const root = {
                    ...routes,
                    path: newBase,
                };
                routes = {
                    path: '/',
                    childRoutes: [
                        root,
                        ...JSON.parse(process.env.KOOT_HISTORY_EXTRABASE).map(
                            (path) => ({
                                path: path
                                    .replace(/^\//, '')
                                    .replace(/\/$/, ''),
                                childRoutes: [root],
                            })
                        ),
                    ],
                };
            } else {
                routes.path = '/' + newBase;
            }
        }

        // console.log(1111, 'routes', routes)

        return routes;
    });

export default validateRouterConfig;

// ============================================================================

const getPromise = (kootConfigRouter) => {
    if (typeof kootConfigRouter !== 'function')
        return new Promise((resolve) => resolve(kootConfigRouter));

    const value = kootConfigRouter();

    if (typeof value.then === 'function' || value instanceof Promise)
        return value;

    return new Promise((resolve) => resolve(value));
};

/**
 * 处理默认路由
 * @param {any} route
 */
const handleIndexRoute = (route) => {
    if (route && (!route.childRoutes || !route.childRoutes.length)) {
        return;
    }

    route.childRoutes = route.childRoutes.filter((child) => {
        // eslint-disable-line
        if (child.isIndex) {
            /* istanbul ignore next */
            if (process.env.NODE_ENV === 'dev' && route.indexRoute) {
                console.error('More than one index route: ', route);
            }

            /* istanbul ignore else */
            if (!route.indexRoute) {
                delete child.path; // eslint-disable-line
                route.indexRoute = child; // eslint-disable-line
                return false;
            }
        }
        return true;
    });

    route.childRoutes.forEach(handleIndexRoute);
};
