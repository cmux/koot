# CSS 使用

### 全局 CSS & 组件 CSS

在 _Koot.js_ 中，我们规定存在有 **2** 种类型的 CSS 文件：全局 CSS (Global CSS)、组件 CSS (Module CSS)

**全局 CSS**

-   所有全局 CSS 文件会根据所属的 Webpack 入口，被抽出为对应的独立的 CSS 文件 (打包结果中的 `extract.[hash].css`)
    -   只有被 JS 代码引用到的 CSS 文件才会被抽出
-   所有这些 CSS 文件结果也会被整合到一个统一的 CSS 文件中 (打包结果中的 `extract.all.[hash].css`)
-   统一的 CSS 文件的文件内容会被自动写入到 `<head>` 标签内的 `<style>` 标签中
-   虽然通常情况下已无需要，不过根据 Webpack 入口抽出的 CSS 文件仍可根据具体的需求独立使用

```javascript
// 在项目代码中引用全局 CSS

// 引用 UI 库 Swiper 的 CSS 文件
// 该 CSS 文件的内容会自动包含到打包结果的 `extract.all.[hash].css` 文件中
// 上述文件的内容会在渲染时自动写入到 `<head>` 内
import 'swiper/dist/css/swiper.min.css';

import React from 'react';
const SomeComponent = () => <div>{/* */}</div>;
export default SomeComponent;
```

**组件 CSS**

-   所有的组件 CSS 必须通过 `extend()` 高阶组件的 `styles` 属性调用
    -   该高阶组件的具体使用方法请查阅 [React/高阶组件 extend](/react?id=高阶组件-extend)
-   这些 CSS 文件内必须有一个名为 `.component` 或 `.[name]__component` 的 className
    -   该 className 会被更换为 hash 结果，如 `.a85c6k` 或 `.nav__bjj15a`
-   `props.className` 会传入到对应的组件，其值为与上述结果对应的 hash 后的 className

除了组件 CSS 要求文件内必须存在特定的 className 外，CSS 的写法无特殊要求。Koot.js 也不强制要求必须为 `.css` 扩展名的文件，`.less` `.scss` `.sass` 也均可以使用。

此外，Koot.js 已默认加入了处理 CSS、LESS 和 SASS 的 webpack loader，无需额外定义。

```less
// 组件 CSS 文件示例
// /src/views/home/index.module.less

// .component 会被自动替换为 hash 结果
.component {
    .cover {
        width: 100%;
        height: 100vh;
    }
}
```

```javascript
// 为 React 组件应用组件 CSS
// /src/views/home/index.jsx

import { extend } from 'koot';

const PageHome = extend({
    // ...
    styles: require('./index.module.less')
    // ...
})(({ className }) => {
    /**
     * 如果父级组件传入了 `props.className`，该子组件的 `props.className` 会包含父级传入的值以及引用的组件 CSS 的样式名
     * 如果父级组件没有传入 `props.className`，该子组件的 `props.className` 仅为引用的组件 CSS 的样式名
     */
    return <div className={className}>{/* */}</div>;
});

export default PageHome;
```

上述 _LESS_ 文件会被转换为

```css
.a85c6k .cover {
    width: 100%;
    height: 100vh;
}
```

### 相关配置

以下是和 _CSS_ 相关的配置项目：

**文件名规则**

通过配置项 `moduleCssFilenameTest` 可为这 2 种 CSS 文件设定文件名规则，该规则为**不包含扩展名的**基本文件名正则表达式。以下是默认设置:

```javascript
module.exports = {
    // ...
    moduleCssFilenameTest: /\.(component|view|module)/
    // ...
};
```

_默认规则解释:_ 文件名以 `.component.css` `.view.css` 或 `.module.css` (扩展名可为 `css` `less` `sass`) 为结尾的文件会当作组件 CSS，其他文件会被当做全局 CSS。

_注:_ _TypeScript_ 项目中，如果修改了上述配置，针对组件 CSS 对象的默认的 TS 定义声明会失效。

**组件 CSS hash 字符串长度**

通过配置项 `classNameHashLength` 可设定组件 CSS hash 字符串长度。

**扩展 less-loader 的配置**

通过配置项 `internalLoaderOptions` 可扩展几乎无法修改的内置 Webpack loader 的配置，比如 `less-loader`。

```javascript
module.exports = {
    // ...
    internalLoaderOptions: {
        'less-loader': {
            modifyVars: {
                'base-font-size': '40px'
            }
        }
    }
    // ...
};
```

### 组件 CSS 的 className hash 规则

原则上，所有以 `.component` 开头的 className 均会被 hash，`component` 之后的字段会原样保留，如：

-   `.component` -> `.adf3`
-   `.component-wrapper` -> `.adf3-wrapper`
-   `.component[data-tip="Open"]` -> `.adf3[data-tip="Open"]`

如果是带有连接器的选择器，一般情况下所有以 `.component` 开头的 className 均会被 hash，但当满足以下条件时，没有任何非属性选择器后缀的非第一个的 `.component` 会被忽略

-   连接器为选择子元素：空格、`>` 等
-   `.component` 出现多次

结果示例：

-   `.component .component` -> `.adf3 .component`
-   `.component .component .component` -> `.adf3 .component .component`
-   `.component .component .component[data-name="test"]` -> `.adf3 .component .component[data-name="test"]`
-   `.component .component .component[data-name=".component"]` -> `.adf3 .component .component[data-name=".component"]`
-   `.component .component-inner` -> `.adf3 .adf3-inner`
-   `.component .wrapper .component` -> `.adf3 .wrapper .component`
-   `.component > .wrapper > .component` -> `.adf3 > .wrapper > .component`
-   `.component ~ .component` -> `.adf3 ~ .adf3`
-   `.component + .component` -> `.adf3 + .adf3`
-   `.component[data-name=".component"]` -> `.adf3[data-name=".component"]`
-   `body.test .component` -> `body.test .adf3`
-   `body.test .component.test2` -> `body.test .adf3.test2`
-   `body.test .component.test2 .component` -> `body.test .adf3.test2 .component`]
