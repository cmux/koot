import React from 'react';
import { extend } from 'koot';

import { Link } from 'react-router';

@extend({
    connect: true,
    pageinfo: () => ({
        title: `${__('pages.home.title')} - ${__('title')}`,
        metas: [{ description: __('pages.home.description') }],
    }),
    styles: require('./styles.component.less'),
})
class PageHome extends React.Component {
    render() {
        return (
            <div className={this.props.className}>
                <div className="cover" ref={el => (this._cover = el)}>
                    <h2>Koot.js</h2>
                    <div className="nav" />
                </div>
            </div>
        );
    }
}

export default PageHome;
