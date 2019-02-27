import React from 'react'
import { extend } from 'koot'

const PageIsomorphic = extend({
    pageinfo: () => ({
        title: `${__('pages.isomorphic.title')} - ${__('title')}`,
        metas: [
            { 'description': __('pages.isomorphic.description') },
        ]
    }),
    styles: require('./styles.component.less')
})(
    ({ routeParams, location, params, route, router, routes, ...props }) => (
        <div {...props}>
            {__('pages.isomorphic.title')}
        </div>
    )
)

export default PageIsomorphic
