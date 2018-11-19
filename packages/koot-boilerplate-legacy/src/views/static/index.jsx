import React from 'react'
import { extend } from 'koot'

const PageStaticAssets = ({
    className
}) =>
    <div className={className}>
        <div className="block">
            <h2>{__('pages.static.method_require')}</h2>
            <p>{__('pages.static.method_require_content')}</p>
            <img src={require('@assets/photo.jpg')} />
        </div>
        <div className="block">
            <h2>{__('pages.static.method_static')}</h2>
            <p>{__('pages.static.method_static_content')}</p>
            <img src="/photo.jpg" />
        </div>
    </div>

export default extend({
    pageinfo: (/*state, renderProps*/) => ({
        title: `${__('pages.static.title')} - ${__('title')}`,
        metas: [
            { 'description': __('pages.static.description') },
            { 'page-name': 'static' },
        ]
    }),
    styles: require('./styles.less'),
})(PageStaticAssets)
