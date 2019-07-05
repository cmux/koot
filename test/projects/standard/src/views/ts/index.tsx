import React from 'react';
import { extend } from 'koot';

const TSComponentExample: React.ComponentClass = extend({
    pageinfo: (/*state, renderProps*/) => ({
        title: `TypeScript - ${__('title')}`,
        metas: [{ description: 'TypeScript' }, { 'page-name': 'ts' }]
    }),
    styles: require('./index.module.less')
})(({ className }) => (
    <div className={className} data-koot-test-page="page-ts">
        <img
            src={require('@assets/typescript.svg')}
            className="logo"
            alt="TypeScript LOGO"
        />
        <p>{__('pages.ts.msg')}</p>
        <A />
    </div>
));

export default TSComponentExample;

const A = extend({
    pageinfo: {
        title: 'AAA',
        metas: [
            {
                'koot-test-meta-aaa': 'AAA'
            }
        ]
    }
})(() => <div>AAA</div>);
