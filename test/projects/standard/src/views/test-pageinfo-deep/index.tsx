import React from 'react';
import { extend } from 'koot';

const TSComponentExample: React.ComponentClass = extend<{}>({
    pageinfo: (/*state, renderProps*/) => ({
        title: `test-pageinfo-deep - ${__('title')}`,
        metas: [
            { description: 'test-pageinfo-deep' },
            { 'page-name': 'test-pageinfo-deep' }
        ]
    }),
    styles: require('./index.module.less')
})(({ className }) => (
    <div className={className} data-koot-test-page="page-test-pageinfo-deep">
        <A />
    </div>
));

export default TSComponentExample;

const A = extend({
    pageinfo: {
        title: 'AAA'
    }
})(() => <div>AAA</div>);
