import React from 'react'
import { extend } from 'koot'

import Center from '@components/center'

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
        <Center {...props}>
            {__('pages.isomorphic.title')}
        </Center>
    )
)

export default PageIsomorphic
