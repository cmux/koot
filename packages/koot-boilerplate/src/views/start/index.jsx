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
            <h2 className="title">{__('pages.start.title')}</h2>
            <ol>
                <li>index.ejs</li>
                <li>routes</li>
                <li>learn: @extend (esp. css)</li>
            </ol>
            <h4 className="title-more">Learn more...</h4>
            <ul>
                <li>config</li>
                <li>redux</li>
                <li>webpack</li>
            </ul>
        </Center>
    )
)

export default PageStart
