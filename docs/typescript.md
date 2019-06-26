# TypeScript 开发

_Koot.js_ 支持 _TypeScript_ 项目的开发，可直接编写 TS 代码并在代码中直接引用其他 TS 代码文件。

_Koot.js_ 自动生成的 _Webpack_ 配置会对 TS 文件进行翻译，无需自行配置。

---

## TSX 代码示例

```tsx
import React from 'react';
import { extend } from 'koot';

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

const TSComponentExample: React.Component = extend({
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
    </div>
));

export default TSComponentExample;
```
