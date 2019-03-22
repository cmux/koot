import React from 'react'
import { extend } from 'koot'

import Center from '@components/center'

const PageStart = extend({
    pageinfo: () => ({
        title: `${__('pages.start.title')} - ${__('title')}`,
        metas: [
            { 'description': __('pages.start.description') },
        ]
    }),
    styles: require('./styles.component.less')
})(
    ({ routeParams, location, params, route, router, routes, ...props }) => (
        <Center {...props}>
            {__('pages.start.title')}
        </Center>
    )
)

export default PageStart
