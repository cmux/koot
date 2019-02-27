import React from 'react'
import { extend } from 'koot'

const PageHome = extend({
    pageinfo: () => ({
        title: `${__('pages.home.title')} - ${__('title')}`,
        metas: [
            { 'description': __('pages.home.description') },
        ]
    }),
    styles: require('./styles.component.less')
})(
    ({ routeParams, location, params, route, router, routes, ...props }) => (
        <div {...props}>
            <div className="cover">
                <h2>Koot.js</h2>
            </div>
            PAGE: HOME
        </div>
    )
)

export default PageHome
