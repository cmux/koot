import React from 'react';
import { extend } from 'koot';
import { Link } from 'react-router';

@extend({
    pageinfo: () => ({
        title: `${__('pages.ts.title')} - ${__('title')}`,
        metas: [{ description: __('pages.ts.description') }]
    }),
    styles: require('./index.module.less')
})
class TSComponentExample extends React.Component {
    render() {
        return (
            <div className={this.props.className} data-koot-test-page="page-ts">
                <img
                    src={require('@assets/typescript.svg')}
                    className="logo"
                    alt="TypeScript LOGO"
                />
                <p className="msg-big">{__('pages.ts.msg')}</p>
                <p className="msg-small">{__('pages.ts.msgCheckFile')}</p>
                <Link to="/start" className="back"></Link>
            </div>
        );
    }
}

export default TSComponentExample;
