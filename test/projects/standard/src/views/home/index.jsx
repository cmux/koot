import React from 'react'
import { extend } from 'koot'

const PageHome = ({
    className
}) =>
    <div className={className}>
        <h2>Koot.js</h2>
    </div>

export default extend({
    connect: true,
    pageinfo: (/*state, renderProps*/) => ({
        title: __('title'),
        metas: [
            { 'description': __('title') },
            { 'page-name': 'home' },
        ]
    }),
    styles: require('./styles.less'),
})(PageHome)
