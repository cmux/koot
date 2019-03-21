import React from 'react'
import { extend } from 'koot'

import Center from '@components/center'

const PageI18n = extend({
    pageinfo: () => ({
        title: `${__('pages.i18n.title')} - ${__('title')}`,
        metas: [
            { 'description': __('pages.i18n.description') },
        ]
    }),
    styles: require('./styles.component.less')
})(
    ({ routeParams, location, params, route, router, routes, ...props }) => (
        <Center {...props}>
            {__('pages.i18n.title')}
        </Center>
    )
)

export default PageI18n
