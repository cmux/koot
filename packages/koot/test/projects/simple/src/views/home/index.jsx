import React from 'react'
import { extend } from 'koot'

const PageHome = ({
    className
}) =>
    <div className={className}>
        <h2>Boilerplate (Simple)</h2>
    </div>

export default extend({
    connect: true,
    pageinfo: (/*state, renderProps*/) => ({
        title: 'Koot Boilerplate (Simple)',
        metas: [
            { 'description': 'Koot Boilerplate (Simple)' },
            { 'page-name': 'home' },
        ]
    }),
    styles: require('./styles.component.less'),
})(PageHome)
