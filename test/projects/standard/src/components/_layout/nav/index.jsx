import { extend } from 'koot';

import Link from '@components/link';

const Nav = (props) => {
    // console.log('Nav render', {
    //     'in __KOOT_SSR__': __KOOT_SSR__.LocaleId
    // });
    const items = [
        {
            title: __('pages.home.title'),
            to: '/',
        },
        {
            title: __('pages.static.title'),
            to: '/static',
        },
        {
            // title: __('pages.delayed.title'),
            title: __('pages', 'delayed', 'title'),
            to: '/delayed',
        },
        {
            title: 'TypeScript',
            to: '/ts',
        },
        {
            title: 'test: modify state',
            to: '/test-modify-state',
        },
    ];

    if (!__SPA__) {
        console.log(
            'testtest',
            `__('pages.extend.title')`,
            __('pages.extend.title')
        );
        items.splice(1, 0, {
            title: __('pages.extend.title'),
            to: '/extend',
        });
    }

    return (
        <div {...props}>
            <h1 className="logo">Koot.js</h1>
            {/* <p className="test-translate">{__('title')}</p> */}
            {items.map((o, index) => (
                <Link
                    key={index}
                    className="nav-item"
                    to={o.to}
                    children={o.title}
                    activeClassName="on"
                />
            ))}
        </div>
    );
};

export default extend({
    styles: require('./styles.less'),
    name: 'Nav',
})(Nav);
