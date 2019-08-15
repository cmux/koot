import React from 'react';
import { extend } from 'koot';

import Issue68 from '@components/issue-68';

const PageHome = ({ className }) => {
    return (
        <div className={className}>
            <h2>Boilerplate (Simple)</h2>
            <p>
                Incididunt deserunt nostrud exercitation duis ad et officia
                velit veniam nulla nostrud commodo adipisicing incididunt. Do
                voluptate in labore occaecat ipsum dolore ex ullamco enim Lorem
                anim est nulla. Aliquip laborum sunt excepteur eu consequat nisi
                duis.
            </p>

            <div className="bg-container">
                <Bg className="bg" type="base" />
                <Bg className="bg" type="base-relative" />
                <Bg className="bg" type="responsive" />
                <Bg className="bg" type="responsive-native" />
            </div>

            <h3>Issue tests</h3>
            <IssueTest children={<Issue68 />} />
        </div>
    );
};

const Bg = ({ className, type }) => (
    <div className={className} data-bg-type={type}>
        <div className="inner" />
    </div>
);

const IssueTest = ({ className = '', ...props }) => (
    <div
        className={[className, 'issue-test'].filter(c => !!c).join(' ')}
        {...props}
    />
);

export default extend({
    connect: true,
    pageinfo: (/*state, renderProps*/) => ({
        title: 'Koot Boilerplate (Simple)',
        metas: [
            { description: 'Koot Boilerplate (Simple)' },
            { 'page-name': 'home' }
        ]
    }),
    styles: require('./styles.component.less')
})(PageHome);
