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
            <p>Ea dolor in et amet anim. Incididunt do proident occaecat magna duis magna minim. Pariatur amet nisi anim enim dolor officia culpa. Dolore ullamco ex ex ad do excepteur duis. Laboris culpa aliquip cupidatat ea eiusmod et aliqua ullamco sit enim amet esse. Quis ipsum exercitation ea adipisicing elit ea minim dolore magna. Esse proident qui aliquip veniam ex ipsum est laborum non eiusmod ad deserunt elit ut.</p>
        </div>
)
