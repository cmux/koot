// import routeCheck from 'koot/React/route-check'
import Root from '@components/app';

export default {
    component: Root,
    name: 'app-root',

    indexRoute: {
        component: require('@views/home').default,
    },

    childRoutes: [
        {
            path: '/route-test/:testId',
            component: require('@views/route-test').default,
        },
        {
            path: '/sass-test',
            component: require('@views/sass-test').default,
        },
        {
            path: '/no-title-only-metas-test',
            component: require('@views/no-title-only-metas').default,
        },
    ],
};
