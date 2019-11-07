import React from 'react';
import { extend } from 'koot';
import clientUpdatePageinfo from 'koot/utils/client-update-pageinfo';

import Issue68 from '@components/issue-68';
import TestAsyncFunction from './test-async-function';

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

            <h3>Test: clientUpdatePageinfo()</h3>
            <div id="__test-client_update_pageinfo">
                <ButtonTestUpdatePageinfo children="Only Title" title={true} />
                <ButtonTestUpdatePageinfo children="Only Metas" metas={true} />
                <ButtonTestUpdatePageinfo
                    children="All"
                    title={true}
                    metas={true}
                />
            </div>

            <TestAsyncFunction />
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

// ============================================================================

const ButtonTestUpdatePageinfo = ({
    children,
    title = false,
    metas = false
}) => {
    function onClick() {
        clientUpdatePageinfo({
            title: title ? 'test-client_update_pageinfo' : undefined,
            metas: metas
                ? [
                      {
                          'test-client_update_pageinfo': 'success'
                      }
                  ]
                : undefined
        });
    }
    return (
        <button
            type="button"
            data-change-title={title ? 'true' : 'false'}
            data-change-metas={metas ? 'true' : 'false'}
            data-role={children}
            onClick={onClick}
        >
            {children}
        </button>
    );
};

// ============================================================================

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
