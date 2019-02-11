import React from 'react'
import { extend } from 'koot'

const PageStatic = extend({
    pageinfo: () => ({
        title: __('pages.static.title')
    }),
    styles: require('./styles.component.less')
})(
    ({ routeParams, location, params, route, router, routes, ...props }) => (
        <div {...props}>
            PAGE: STATIC
        </div>
    )
)

export default PageStatic
