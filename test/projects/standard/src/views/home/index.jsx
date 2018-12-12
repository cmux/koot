import React from 'react'
import { extend } from 'koot'

export default extend({
    pageinfo: (/*state, renderProps*/) => ({
        title: __('title'),
        metas: [
            { 'description': __('title') },
            { 'page-name': 'home' },
        ]
    }),
    styles: require('./styles.less'),
})(
    ({
        className
    }) =>
        <div className={className} id="page-home-body">
            <h2>Koot.js</h2>
            <p>Qui reprehenderit sunt ut nostrud mollit fugiat esse consequat quis id officia officia. Adipisicing officia tempor esse adipisicing excepteur cillum Lorem non consequat magna. Duis cillum reprehenderit qui minim est eu. Esse labore cillum voluptate labore nostrud anim occaecat enim tempor quis et ipsum ut. Magna pariatur do consequat proident mollit eiusmod non. Irure anim ex cupidatat id culpa nulla nulla. Mollit minim deserunt nostrud nulla ad in enim anim.</p>
        </div>
)
