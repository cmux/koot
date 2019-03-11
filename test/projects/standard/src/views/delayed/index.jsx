import React from 'react'
import { extend, localeId } from 'koot'

import TS from '@components/ts'

export default extend({
    connect: state => ({
        localeId: state.localeId
    }),
    pageinfo: (/*state, renderProps*/) => ({
        title: `${__('pages.delayed.title')} - ${__('title')}`,
        metas: [
            { 'description': __('pages.delayed.description') },
            { 'page-name': 'delayed' },
        ]
    }),
    styles: require('./styles.less'),
    name: 'PageDelayed'
})(
    ({
        className, localeId
    }) =>
        <div className={className}>
            <p>{__('pages.delayed.description')}</p>
            <ul>
                <li><em>props.localeId:</em> {localeId}</li>
                <li><em>{"import { localeId } from 'koot': "}</em> {localeId}</li>
            </ul>
            <p>TS</p>
            <TS />
        </div>
)
