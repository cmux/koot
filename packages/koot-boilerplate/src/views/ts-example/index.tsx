import React from 'react';
import { extend } from 'koot';
import { Link } from 'react-router';

import Icon from '@components/icon';

/*

There is no official TS support for class decorator yet
We suggest that write Functional Component when using HOC
If you have a solution for this problem, feel free submitting it on our GitHub repo
https://github.com/cmux/koot

当前 TS 官方尚未支持类的装饰器语法 (class decorator)
我们建议在使用高阶组件 (HOC) 时采用函数式组件 (Functional Component) 的写法
如果你有解决该问题的方案，欢迎发布到我们的 GitHub 上
https://github.com/cmux/koot

*/

const TSComponentExample: React.ComponentClass = extend({
    pageinfo: () => ({
        title: `${__('pages.ts.title')} - ${__('title')}`,
        metas: [{ description: __('pages.ts.description') }]
    }),
    styles: require('./index.module.less')
})(({ className }) => (
    <div className={className} data-koot-test-page="page-ts">
        <img
            src={require('@assets/typescript.svg')}
            className="logo"
            alt="TypeScript LOGO"
        />
        <p className="msg-big">{__('pages.ts.msg')}</p>
        <p className="msg-small">{__('pages.ts.msgCheckFile')}</p>
        <Link to="/start" className="back">
            <Icon className="icon" icon="circle-left3" />
            {__('pages.ts.back')}
        </Link>
    </div>
));

export default TSComponentExample;
