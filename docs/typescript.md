# TypeScript 开发

_Koot.js_ 支持 _TypeScript_ 项目的开发，可直接编写 TS 代码并在代码中直接引用其他 TS 代码文件。

_Koot.js_ 自动生成的 _Webpack_ 配置会对 TS 文件进行翻译，无需自行配置。

---

### TSX 代码示例

**函数组件 / Functional Component**

```typescript
import React from 'react';
import { extend } from 'koot';
import { Link } from 'react-router';

import Icon from '@components/icon';

// Functional Component =======================================================

const TSFunctionalComponent: React.ComponentClass = extend({
    pageinfo: () => ({
        title: `${__('pages.ts.title')} - ${__('title')}`,
        metas: [{ description: __('pages.ts.description') }]
    }),
    styles: require('./index.module.less')
})(({ className, children }) => (
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
        {children}
    </div>
));

export default TSFunctionalComponent;
```

**组件类 / Component Class**

```typescript
import React from 'react';
import { extend, ExtendedProps } from 'koot';
import { Link } from 'react-router';

import Icon from '@components/icon';

// Component Class ============================================================

@extend({
    pageinfo: () => ({
        title: `${__('pages.ts.title')} - ${__('title')}`,
        metas: [{ description: __('pages.ts.description') }]
    }),
    styles: require('./index.module.less')
})
class TSComponentClass extends React.Component<ExtendedProps> {
    render() {
        const { className, children } = this.props;
        return (
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
                {children}
            </div>
        );
    }
}

export default TSComponentClass;
```
