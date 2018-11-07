import routeCheck from 'koot/React/route-check'
import Root from '@components/app'

export default {

    component: Root,
    name: 'app-root',

    indexRoute: {
        component: require('@views/home').default
    }

}
