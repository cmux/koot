import React from 'react'
import { extend } from 'koot'

const PageHome = extend({
    pageinfo: () => ({
        title: __('pages.home.title')
    }),
    styles: require('./styles.component.less')
})(
    ({ routeParams, location, params, route, router, routes, ...props }) => (
        <div {...props}>
            PAGE: HOME
        </div>
    )
)

export default PageHome
