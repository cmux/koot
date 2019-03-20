import React from 'react'
import { extend } from 'koot'

import Center from '@components/center'

const PageStatic = extend({
    pageinfo: () => ({
        title: `${__('pages.static.title')} - ${__('title')}`,
        metas: [
            { 'description': __('pages.static.description') },
        ]
    }),
    styles: require('./styles.component.less')
})(
    ({ routeParams, location, params, route, router, routes, ...props }) => (
        <Center {...props}>
            {__('pages.static.title')}
        </Center>
    )
)

export default PageStatic
