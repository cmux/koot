import React from 'react';
import { extend } from 'koot';

const TSComponentExample: React.ComponentClass = extend({
    styles: require('./index.module.less')
})(({ className }) => (
    <div className={className} data-koot-test-page="page-ts">
        <img
            src={require('@assets/typescript.svg')}
            className="logo"
            alt="TypeScript LOGO"
        />
        <p>{__('pages.ts.msg')}</p>
    </div>
));

export default TSComponentExample;
