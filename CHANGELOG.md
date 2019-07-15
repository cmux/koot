## 0.11.0 (in-dev)

**????-??-??**

核心

-   **优化**
    -   多语言翻译函数 (`__()`) 现支持返回一个对象或数组
    -   SSR
        -   _服务器端_: 现支持有超大型语言包的项目
    -   开发环境
        -   _客户端_：减少部分初始的日志输出
-   更新依赖包
    -   minor
        -   `inquirer` -> _6.5.0_
    -   patch
        -   `@babel/core` -> _7.5.4_
        -   `@babel/plugin-proposal-object-rest-spread` -> _7.5.4_
        -   `@babel/preset-env` -> _7.5.4_
        -   `@types/node` -> _12.6.2_
        -   `copyfiles` -> _2.1.1_
        -   `lodash` -> _4.17.14_
        -   `portfinder` -> _1.0.21_
        -   `react-hot-loader` -> _4.12.6_
        -   `redux` -> _4.0.4_

**koot-boilerplate**

-   更新依赖包
    -   minor
        -   `lint-staged` -> _9.2.0_

**koot-cli**

-   更新依赖包
    -   minor
        -   `inquirer` -> _6.5.0_
    -   patch
        -   `isbinaryfile` -> _4.0.2_

## 0.10.5

**2019-07-09**

核心

-   **错误修正**
    -   修正：SPA `index.html` 中没有加载 `service-worker`
-   更新依赖包
    -   patch
        -   `@babel/plugin-proposal-object-rest-spread` -> _7.5.2_
        -   `@babel/preset-env` -> _7.5.2_
        -   `@types/node` -> _12.6.1_
        -   `redux` -> _4.0.2_
        -   `typescript` -> _3.5.3_
        -   `webpack` -> _4.35.3_

## 0.10.4

**2019-07-08**

核心

-   **优化**
    -   继续优化：高阶组件 `extend()` 现在会尝试使用来自于最深部的组件的页面信息 (`pageinfo`)，而非来自父级或外部组件
    -   为 TS 加入更多的全局常量定义
-   **错误修正**
    -   修正：启动开发环境时，会多次打开首页

## 0.10.3

**2019-07-08**

核心

-   更新依赖包
    -   patch
        -   `react-hot-loader` -> _4.12.5_

## 0.10.2

**2019-07-07**

核心

-   更新依赖包
    -   patch
        -   `@babel/plugin-proposal-object-rest-spread` -> _7.5.1_

**koot-boilerplate**

-   更新依赖包
    -   minor
        -   `lint-staged` -> _9.1.0_
    -   patch
        -   `autoprefixer` -> _9.6.1_

**koot-webpack**

-   继续针对开发环境热更新调整生成的 _Webpack_ 配置

## 0.10.1

**2019-07-06**

核心

-   **优化**
    -   优化开发环境热更新能力
-   添加依赖包
    -   `@hot-loader/react-dom`

**koot-webpack**

-   针对开发环境热更新调整生成的 _Webpack_ 配置

## 0.10.0

**2019-07-06**

核心

-   **重大改动**
    -   `node.js` 最低版本要求提升到 `8.9.0`
    -   SSR
        -   _服务器_: 请求隐藏文件现在会默认返回 404 (可通过配置 `koaStatc.hidden` 来调整这一行为)
-   **新特性**
    -   现支持使用 _TypeScript_ 开发 _React_ 组件。详情请参见文档 [TypeScript 开发](https://koot.js.org/#/typescript)
    -   `extend()` React 高阶组件新增选项 `ssr`：可控制对应组件的 SSR 行为。详情请参见文档 [React 开发](https://koot.js.org/#/react?id=参数)
    -   SSR
        -   生产环境服务器现在加入一些基础的安全机制，如防御 XSS 等 (使用 `koa-helmet` 实现) ([#135](https://github.com/cmux/koot/issues/135))
    -   SPA
        -   现在生产环境下会创建一个简易服务器的启动脚本文件 (位于打包目录下的 `/.server/index.js`) ([#103](https://github.com/cmux/koot/issues/103))
    -   **新配置项** `sessionStore` - 将全部或部分 _state_ 对象暂存在 `sessionStorage` 中，在刷新页面后这些 _state_ 会自动还原。详情请参见文档 [配置/sessionStore](https://koot.js.org/#/config?id=sessionStore) ([#104](https://github.com/cmux/koot/issues/104))
    -   **新函数** `createStore()` - 方便项目更便捷的创建 _Redux store_ ([#105](https://github.com/cmux/koot/issues/105))
        -   `import { createStore } from 'koot';`
        -   `export default () => createStore(appReducer, appMiddlewares);`
        -   具体用法请参见文档 [配置/store](https://koot.js.org/#/config?id=store)
-   **优化**
    -   高阶组件 `extend()` 现在会尝试使用来自于最深部的组件的页面信息 (`pageinfo`)，而非来自父级或外部组件
    -   `service-worker`
        -   默认的注册逻辑调整，现在会在 `document.onLoad` 时进行注册
        -   当请求没有本地缓存且访问出错时，现在会输出对应的 HTTP 请求结果
    -   SSR
        -   _服务器_: 会尝试自动修改 _Webpack_ 的 `file-loader` 的配置，尽量避免输出静态资源文件 ([#83](https://github.com/cmux/koot/issues/83))
    -   分析模式
        -   优化分析模式输出文件名的可读性
-   添加依赖包
    -   `@babel/preset-typescript`
    -   `@types/node`
    -   `@types/react`
    -   `@types/react-dom`
    -   `@types/react-redux`
    -   `@types/react-router`
    -   `execa`
    -   `koa-helmet`
    -   `lodash`
    -   `typescript`
-   更新依赖包
    -   major
        -   `cache-loader` -> _4.0.1_
        -   `css-loader` -> _3.0.0_
        -   `file-loader` -> _4.0.0_
        -   `url-loader` -> _2.0.1_
        -   `os-locale` -> _4.0.0_
    -   minor
        -   `@babel/core` -> _7.5.0_
        -   `@babel/plugin-proposal-class-properties` -> _7.5.0_
        -   `@babel/plugin-proposal-object-rest-spread` -> _7.5.0_
        -   `@babel/plugin-transform-runtime` -> _7.5.0_
        -   `@babel/preset-env` -> _7.5.0_
        -   `cli-spinners` -> _2.2.0_
        -   `fs-extra` -> _8.1.0_
        -   `inquirer` -> _6.4.1_
        -   `mini-css-extract-plugin` -> _0.7.0_
        -   `open` -> _6.4.0_
        -   `react-hot-loader` -> _4.12.3_
        -   `webpack` -> _4.35.2_
        -   `webpack-dev-server` -> _3.7.2_
    -   patch
        -   `ejs` -> _2.6.2_
        -   `postcss` -> _7.0.17_

**koot-boilerplate**

-   优化默认文件夹结构
-   添加 _TypeScript_ 组件开发示例
-   SSR
    -   现在服务器环境的打包结果中，不再会出现静态资源文件
-   更新依赖包
    -   major
        -   `husky` -> _3.0.0_
        -   `lint-staged` -> _9.0.2_
        -   `svg-url-loader` -> _3.0.0_
    -   minor
        -   `eslint-config-koot` -> _0.2.0_

**koot-cli**

-   更新依赖包
    -   minor
        -   `fs-extra` -> _8.1.0_
        -   `inquirer` -> _6.4.1_
    -   patch
        -   `semver` -> _6.2.0_

**koot-webpack**

-   SSR 项目生产环境服务器端打包时，`performance` 下的 `maxEntrypointSize` 和 `maxAssetSize` 均设置为 `1MB`
-   **css-loader**
    -   现在 `url()` 引用的结果会添加引号

## 0.9.10

**2019-06-26**

**koot-cli**

-   现在可以创建 Koot 开发中版本的项目

## 0.9.9

**2019-06-21**

核心

-   **优化**
    -   确保 _ChunkMap_ 中 `service-worker` 地址的正确性
    -   多语言翻译函数 (`__()`) 现支持更多类型的传入字符

## 0.9.8

**2019-06-20**

核心

-   **优化**
    -   确保 _Webpack_ 配置中 `output` 的合法性
-   **错误修正**
    -   修正：某些情况下，开发环境中 `critical.js` 没有正确加载

**koot-boilerplate**

-   优化默认 _Webpack_ 配置

## 0.9.7

**2019-06-18**

-   核心
    -   工具代码（Utility）
        -   `get-client-file-path.js` - 如果目标文件被 _Webpack_ 拆分，现在会返回包含所有文件的路径的 _Array_

## 0.9.6

**2019-06-17**

-   核心
    -   React
        -   高阶组件 `extend()`
            -   优化 `props.updatePageinfo` 方法行为方式

## 0.9.5

**2019-06-17**

-   核心
    -   React
        -   高阶组件 `extend()`
            -   如果提供了 `pageinfo` 配置，组件会新增 `props.updatePageinfo` 方法，可用来手动触发页面信息更新

## 0.9.4

**2019-06-12**

-   核心
    -   Webpack
        -   现在会正确处理 CSS 中 `cursor` 属性的 `url()` 引用

## 0.9.3

**2019-06-12**

-   核心
    -   SPA
        -   通过 `<link>` 标签自动引入的 CSS 文件，现在会引用正确的资源文件地址 ([#121](https://github.com/cmux/koot/issues/121))

## 0.9.2

**2019-05-31**

-   核心
    -   错误修正
        -   React SSR 项目的开发环境内，在服务器端的打包结果更新后，服务器端不会自动重启的问题

## 0.9.1

**2019-05-24**

-   **koot-cli**
    -   错误修正
        -   创建新项目时 `package.json` 中 `koot.baseVersion` 值错误的问题

## 0.9.0

**2019-05-24**

-   **重大改动**
    -   调整默认的 React SSR 项目客户端打包结果目录结构
        -   通过 `koot-cli` 更新的项目不受影响
            -   如果想要开启该功能，请手动修改 _Koot_ 配置文件，添加 `bundleVersionsKeep` 项
        -   现在会在 `public` 目录下建立多个名为 `koot-[时间戳]` 的目录
        -   以最新的时间戳命名的目录即为当前的客户端打包结果
        -   保留的这些目录的数量可控，默认为 `2` (新配置项 `bundleVersionsKeep`)
        -   该功能可主动关闭 (新配置项 `bundleVersionsKeep`)
-   核心
    -   配置项
        -   **新** `classNameHashLength` - 调整组件 CSS 的 className hash 长度。详情请参见文档 [配置/classNameHashLength](https://koot.js.org/#/config?id=classNameHashLength)
        -   **新** `bundleVersionsKeep` - 指定客户端打包结果保留的版本的个数。详情请参见文档 [配置/bundleVersionsKeep](https://koot.js.org/#/config?id=bundleVersionsKeep) ([#79](https://github.com/cmux/koot/issues/79))
        -   **新** `devMemoryAllocation` - 指定开发环境中 node.js 分配的内存。详情请参见文档 [配置/devmemoryallocation](https://koot.js.org/#/config?id=devmemoryallocation)
        -   `webpackBefore` 和 `webpackAfter` 回调函数传入的参数对象新增额外信息。详情请参见文档 [配置/webpackbefore](https://koot.js.org/#/config?id=webpackbefore)
    -   现在可以使用 `yarn` 安装并使用 _Koot.js_ ([#99](https://github.com/cmux/koot/issues/99))
    -   现在可以在 NPM 命令中动态添加变量了，这些变量会自动添加到环境变量中，并允许在项目代码中随意调用。详情请参见文档 [环境变量/动态添加环境变量](https://koot.js.org/#/env?id=动态添加环境变量) ([#78](https://github.com/cmux/koot/issues/78))
    -   SSR 渲染 & SPA 模板
        -   结尾现在会附带 koot 版本信息作为 HTML 代码注释 ([#64](https://github.com/cmux/koot/issues/64))
        -   如果 ejs 模板中缺少关键注入项 (`inject`)，现在会自动添加 ([#81](https://github.com/cmux/koot/issues/81))
    -   SSR
        -   现在会确保在多次服务器打包进程之间正确的重置 `koot-css-loader` 的计数器 ([#100](https://github.com/cmux/koot/issues/100))
    -   Webpack
        -   `koot-css-loader`
            -   如果 CSS 属性值包含多个 `url()`，现在会正确处理 ([#82](https://github.com/cmux/koot/issues/82))
            -   类似 `.component .component` 这样使用空格 (``) 选择器或 `>` 选择器时，现在选择器之后的 `.component` 字段会被保留，不会进行 hash。使用其他选择器的情况依旧会进行 hash。详情请参见文档 [CSS/组件 CSS 的 className hash 规则](https://koot.js.org/#/css?id=组件-css-的-classname-hash-规则) ([#68](https://github.com/cmux/koot/issues/68))
            -   默认的 className hash 长度调整为 `6`
    -   开发环境
        -   现在进入开发环境不再会影响打包结果目录 ([#101](https://github.com/cmux/koot/issues/101))
        -   现在修改 `.ejs` 模板后刷新页面即可看到新的结果 ([#95](https://github.com/cmux/koot/issues/95))
        -   由于上述 className hash 和 `koot-css-loader` 的改动，开发环境下默认的组件 CSS className hash 长度调整为 `6` (与生产环境相同)
    -   分析模式
        -   现在进入分析模式不再会影响打包结果目录
    -   错误修正
        -   修正某些情况下，自动生成的 `service-worker` 文件无法正常处理离线请求的问题
    -   更新依赖包
        -   major
            -   `cache-loader` -> _3.0.1_
            -   `cli-spinners` -> _2.1.0_
            -   `cookie` -> _0.4.0_
            -   `fs-extra` -> _8.0.1_
            -   `less-loader` -> _5.0.0_
            -   `opn` -> `open` _6.3.0_
        -   minor
            -   `inquirer` -> _6.3.1_
            -   `mini-css-extract-plugin` -> _0.6.0_
            -   `pm2` -> _3.5.1_
            -   `webpack` -> _4.32.2_
            -   `webpack-bundle-analyzer` -> _3.3.2_
            -   `webpack-dev-middleware` -> _3.7.0_
            -   `webpack-dev-server` -> _3.4.1_
            -   `webpack-hot-middleware` -> _2.25.0_
        -   patch
            -   `@babel/core` -> _7.4.5_
            -   `@babel/plugin-proposal-class-properties` -> _7.4.4_
            -   `@babel/plugin-proposal-decorators` -> _7.4.4_
            -   `@babel/plugin-proposal-object-rest-spread` -> _7.4.4_
            -   `@babel/plugin-transform-regenerator` -> _7.4.5_
            -   `@babel/plugin-transform-runtime` -> _7.4.4_
            -   `@babel/polyfill` -> _7.4.4_
            -   `@babel/preset-env` -> _7.4.5_
            -   `@babel/register` -> _7.4.4_
            -   `babel-loader` -> _8.0.6_
            -   `copy-webpack-plugin` -> _5.0.3_
            -   `es5-shim` -> _4.5.13_
            -   `glob` -> _7.1.4_
            -   `is-port-reachable` -> _2.0.1_
            -   `postcss` -> _7.0.16_
            -   `react-hot-loader` -> _4.8.8_
            -   `yargs` -> _13.2.4_
-   **koot-cli**
    -   更新依赖包
        -   major
            -   `fs-extra` -> _8.0.1_
            -   `semver` -> _6.0.0_
        -   minor
            -   `inquirer` -> _6.3.1_
            -   `latest-version` -> _5.1.0_
            -   `npm-email` -> _3.2.0_
            -   `ora` -> _3.4.0_
            -   `package-json` -> _6.3.0_
-   **koot-boilerplate**
    -   添加 `eslint-config-koot` 和 `prettier` 配置
    -   添加 `husky` 和 `lint-stagged` 开发依赖包和相关配置
        -   在 `git commit` 之前，自动对部分语法和编写习惯进行修复
    -   更新动态路由的写法
        -   使用 Webpack 的 `import()` 语法

## 0.8.9

**2019-04-11**

-   错误修正
    -   _SPA_ 首次访问时页面信息没有正确更新 ([#96](https://github.com/cmux/koot/issues/96))

## 0.8.8

**2019-04-10**

-   核心
    -   现在会在打包流程完成后，删除临时目录 (`/logs/temp`)
-   错误修正
    -   _开发环境_ 访问没有指定组件的路由时，服务器报错并中止运行 ([#88](https://github.com/cmux/koot/issues/88))
    -   _SPA_ 没有指定 `templateInject` 选项时，打包失败 ([#87](https://github.com/cmux/koot/issues/87))

## 0.8.7

**2019-04-04**

-   核心
    -   开发环境
        -   进一步优化热更新速度
-   React
    -   高阶组件 `extend()`
        -   `pageinfo` 现在允许直接传入 _Object_
-   React 同构
    -   进一步优化开发环境下数据同构和页面信息更新的能力
    -   KOA `ctx` 新增: `ctx.originTrue` `ctx.hrefTrue`
    -   HTML 结果中的本域 URL，现在均会遵循 `proxyRequestOrigin` 的设置
-   更新依赖包
    -   patch
        -   `webpack-dev-middleware` -> _3.6.2_

## 0.8.6

**2019-04-03**

-   React 同构
    -   进一步优化开发环境下数据同构的能力
-   更新依赖包
    -   patch
        -   `@babel/core` -> _7.4.3_
        -   `@babel/plugin-proposal-object-rest-spread` -> _7.4.3_
        -   `@babel/plugin-transform-regenerator` -> _7.4.3_
        -   `@babel/plugin-transform-runtime` -> _7.4.3_
        -   `@babel/polyfill` -> _7.4.3_
        -   `@babel/preset-env` -> _7.4.3_
        -   `commander` -> _2.20.0_
        -   `ora` -> _3.4.0_

## 0.8.5

**2019-04-01**

-   错误修正
    -   修正开发环境下错误的 DLL 文件引用关系
-   更新依赖包
    -   patch
        -   `react-hot-loader` -> _4.8.2_

## 0.8.4

**2019-03-29**

-   React SPA
    -   进一步优化模板注入

## 0.8.3

**2019-03-29**

-   错误修正
    -   修复 SPA 项目无法开启开发环境的问题
-   更新依赖包
    -   patch
        -   `react` -> _16.8.6_
        -   `react-dom` -> _16.8.6_

## 0.8.2

**2019-03-28**

-   核心
    -   Webpack 打包
        -   优化错误信息的显示
-   错误修正
    -   修正 SPA 类型的项目在打包时由模板注入 (template inject) 引发的问题

## 0.8.1

**2019-03-23**

-   错误修正
    -   修复一处阻止开发环境正常启动的问题
-   更新依赖包
    -   patch
        -   `copy-webpack-plugin` -> _5.0.2_
        -   `react` -> _16.8.5_
        -   `react-dom` -> _16.8.5_

## 0.8.0

**2019-03-22**

-   **重大改动**
    -   重写 React 同构服务器逻辑，原则上对已有项目不会造成影响
        -   若发现从 `koot` 中引用的 `store` `history` 或 `localeId` 值为 `undefined`，请尝试改为使用 `getStore()` `getHistory()` 或 `getLocaleId()` 方法
    -   移除了 `sp-css-import`，请修改为新式的 `@extend()` 写法
    -   移除了 `pageinfo()`，请修改为新式的 `@extend()` 写法
    -   调整了项目配置方案，原则上对已有项目不会造成影响
        -   0.6 版本之前的配置文件现已不再支持
    -   调整 CSS 打包、使用规则
        -   现在明确只存在 2 种 CSS 文件：全局 CSS 和组件 CSS
        -   可通过配置文件对文件名规则进行配置。详情请参见文档的 [CSS 使用/配置](https://koot.js.org/#/css?id=配置)
        -   全局 CSS 规则
            -   所有全局 CSS 文件会根据所属的 Webpack 入口，被抽出为对应的独立的 CSS 文件 (打包结果中的 `extract.[hash].css`)
            -   所有这些 CSS 文件结果也会被整合到一个统一的 CSS 文件中 (打包结果中的 `extract.all.[hash].css`)
            -   统一的 CSS 文件的文件内容会被自动写入到 `<head>` 标签内的 `<style>` 标签中
            -   虽然通常情况下已无需要，不过根据 Webpack 入口抽出的 CSS 文件仍可根据具体的需求独立使用
        -   组件 CSS 规则
            -   所有的组件 CSS 必须通过 `extend` 高阶组件的 `styles` 选项调用
            -   这些 CSS 文件必须有一个名为 `.component` 或 `.[name]__component` 的 className
                -   该 className 会被更换为 hash 结果，如 `.a85c6k` 或 `.nav__bjj15a`
            -   `props.className` 会传入到对应的组件，其值为与上述结果对应的 hash 后的 className
-   核心
    -   配置项
        -   **新** `historyType` - 项目所用的 `history` 组件的类型。详情请参见文档的 [配置](https://koot.js.org/#/config?id=historytype) 章节
        -   **新** `internalLoaderOptions` - 用以扩展几乎无法修改的内置 `loader` 所用的设置。详情请参见文档的 [配置](https://koot.js.org/#/config?id=internalloaderoptions) 章节
        -   **新** `serverOnRender.beforeDataToStore` 和 `serverOnRender.afterDataToStore` - 允许更详细的使用服务器端渲染生命周期。详情请参见文档的 [配置](https://koot.js.org/#/config?id=Webpack) 章节
        -   `cookiesToStore` 现支持传入 `true`: 同步所有 cookie，包括 cookie 原始字符串 (以 `__` 为名称)
        -   `staticCopyFrom` / `staticAssets` 现支持传入 _Array_
    -   优化 `koot-start` 命令，进一步尝试避免 `koot-build 命令未找到` 的问题
    -   Webpack 打包
        -   打包时不再会在项目根目录下生成临时文件，这些文件现在移至 `/logs/tmp/` 目录下
        -   现在每种打包模式仅保留最近 2 次打包的日志文件 (`/logs/webpack-config/` 目录下)
    -   开发环境
        -   大辅优化热更新能力
            -   默认关闭 `webpack` 热更新的 `多步骤 (multiStep)` 机制，配置项 `devHmr` (原 `webpack.hmr`) 现不再有默认值，若仍需要开发环境的多步打包功能，请手动开启
        -   将大部分开发环境所用的临时文件和标记文件整合、移动到 `/logs/dev/` 目录中
-   React
    -   根层组件添加 `componentDidCatch` 生命周期方法，以进一步保障 React 输出渲染结果
-   React 同构
    -   确保 `connect` 封装的组件，其数据同构功能可用
-   React SPA
    -   对于传入自定 `store` 对象或生成方法的项目，确保生成 `store` 使用的 `history` 对象为浏览器所用对象
    -   移除 `AppContainer` 逻辑的相关文件
-   添加依赖包
    -   `cache-loader`
    -   `extract-hoc`
    -   `thread-loader`
-   移除依赖包
    -   `autoprefixer`
    -   `koa-compose`
    -   `koa-compress`
    -   `koa-helmet`
    -   `koa-html-minifier`
    -   `koa-json`
    -   `koa-multer`
    -   `koa-onerror`
    -   `koa-response-time`
    -   `progress`
    -   `sp-css-import`
-   更新依赖包
    -   major
        -   `cli-spinners` -> _2.0.0_
        -   `copy-webpack-plugin` -> _5.0.1_
        -   `css-loader` -> _2.1.0_
        -   `file-loader` -> _3.0.1_
        -   `koa-body` -> _4.1.0_
        -   `koa-mount` -> _4.0.0_
        -   `koa-static` -> _5.0.0_
        -   `yargs` -> _13.2.2_
    -   minor
        -   `@babel/core` -> _7.4.0_
        -   `@babel/plugin-proposal-class-properties` -> _7.4.0_
        -   `@babel/plugin-proposal-decorators` -> _7.4.0_
        -   `@babel/plugin-proposal-object-rest-spread` -> _7.4.0_
        -   `@babel/plugin-syntax-dynamic-import` -> _7.2.0_
        -   `@babel/plugin-transform-regenerator` -> _7.4.0_
        -   `@babel/plugin-transform-runtime` -> _7.4.0_
        -   `@babel/polyfill` -> _7.4.0_
        -   `@babel/preset-env` -> _7.4.2_
        -   `@babel/register` -> _7.4.0_
        -   `acorn` -> _6.1.1_
        -   `autoprefixer` -> _9.4.7_
        -   `koa` -> _2.7.0_
        -   `less` -> _3.9.0_
        -   `mini-css-extract-plugin` -> _0.5.0_
        -   `pm2` -> _3.3.1_
        -   `opn` -> _5.5.0_
        -   `ora` -> _3.2.0_
        -   `os-locale` -> _3.1.0_
        -   `react` -> _16.8.4_
        -   `react-dom` -> _16.8.4_
        -   `react-hot-loader` -> _4.8.0_
        -   `webpack` -> _4.29.6_
        -   `webpack-bundle-analyzer` -> _3.1.0_
        -   `webpack-dev-middleware` -> _3.6.1_
        -   `webpack-dev-server` -> _3.2.1_
    -   patch
        -   `babel-loader` -> _8.0.5_
        -   `chalk` -> _2.4.2_
        -   `css-loader` -> _2.1.1_
        -   `debug` -> _4.1.1_
        -   `inquirer` -> _6.2.2_
        -   `portfinder` -> _1.0.20_
        -   `postcss` -> _7.0.14_
        -   `rimraf` -> _2.6.3_

## 0.7.14

**2018-03-07**

-   React 同构 (`ReactApp`)
    -   延长 `routerMatch` 超时的检测时间

## 0.7.13

**2018-02-22**

-   React 同构 (`ReactApp`)
    -   进一步对客户端运行脚本进行优化，以减少初始渲染时闪屏出现几率

## 0.7.12

**2018-12-24**

-   React
    -   高阶组件 `extend()`
        -   确保 `pageinfo` 方法会被执行

## 0.7.11

**2018-12-17**

-   核心
    -   多语言
        -   同构时如果获取的语种 ID 在项目中不存在，现在会忽略该值

## 0.7.10

**2018-12-12**

-   核心
    -   配置项
        -   现在会处理 `server.onRender.beforeDataToStore` 或 `server.onRender.afterDataToStore` 配置为 `Pathname` 类型的情况

## 0.7.9

**2018-12-12**

-   核心
    -   配置项
        -   **新** `server.onRender.beforeDataToStore` 和 `server.onRender.afterDataToStore` - 允许对服务器渲染时的生命周期方法进行更详细的设定。详情请参见文档的 [配置/服务器端](https://koot.js.org/#/config?id=服务器端) 章节

## 0.7.8

**2018-12-11**

-   错误修正
    -   修复客户端无法保存当前语种 ID 的问题

## 0.7.7

**2018-12-11**

-   核心
    -   配置项
        -   **新** `i18n.use` - 配置多语言项目的 URL 使用方式。详情请参见文档的 [配置/多语言](https://koot.js.org/#/config?id=多语言) 章节
    -   多语言
        -   现支持第一级路由为语种 ID 的使用方案 (`i18n.use = 'router'`)
        -   自动添加的多语言跳转 meta 标签现在会过滤掉当前语言的标签
-   React 同构 (`ReactApp`)
    -   改进服务器输出 CSS 结果时的稳定性
-   更新依赖包
    -   patch
        -   `react-router` -> _3.2.1_

## 0.7.6

**2018-12-04**

-   核心
    -   配置项
        -   **新** `server.proxyRequestOrigin` - 若本 Node.js 服务器是通过其他代理服务器请求的（如 nginx 反向代理），可用这个配置对象声明原请求的信息。详情请参见文档的 [配置](https://koot.js.org/#/config) 章节
    -   PWA
        -   `service-worker` 默认行为调整，现在初始时仅会对 `.js` 文件进行缓存
-   错误修正
    -   修复某些情况下，同构服务器启动端口不正确的问题

## 0.7.5

**2018-12-03**

-   React
    -   高阶组件 `extend()`
        -   `connect` 现在支持传入 Array，以对应 `react-redux` 的 `connect()` 的多参数情形
-   React 同构 (`ReactApp`)
    -   确保服务器的 `onRender` 生命周期仅响应可用的请求，同时确保此时的数据为最新可用的数据
-   错误修正
    -   修复某些情况下，模板注入 (`inject`) 使用的 `state` 失效的问题
    -   修复某些情况下，Webpack 打包因出错挂起的问题

## 0.7.4

**2018-11-29**

-   核心
    -   Webpack 打包
        -   现在每种打包模式仅保留最近 5 次打包的日志文件 (`/logs/webpack-config/` 目录下)
-   React 同构 (`ReactApp`)
    -   注入 (`inject`) 现在支持函数写法，详情请参见文档的 [HTML 模板](https://koot.js.org/#/template) 章节
-   React SPA
    -   不启用多语言的项目现在可以恢复使用 SPA 模式了
-   错误修正
    -   修复并发访问时存在多个 `koot-locale-id` meta 标签的问题
    -   修复某些情况下，HTML 同构结果中 `<script>` 标签之间会出现额外逗号 (`,`) 的问题
-   更新依赖包
    -   minor
        -   `webpack` -> _4.26.1_
    -   patch
        -   `mini-css-extract-plugin` -> _0.4.5_
        -   `terminate` -> _2.1.2_
        -   `yargs` -> _12.0.5_

## 0.7.3

**2018-11-22**

-   核心
    -   配置项
        -   **新** `webpack.hmr` - 可选。开发模式下 `webpack.HotModuleReplacementPlugin` 插件的配置对象。详情请参见文档的 [配置](https://koot.js.org/#/config) 章节
    -   多语言
        -   翻译方法 (默认 `__()`) 现在支持语言包中类型为 `Array` 的内容
    -   开发模式
        -   `react` 自动热更新能力现在支持更多的情况
-   React
    -   支持提供 `store` 创建方法函数的项目

## 0.7.0

**2018-11-19**

-   核心
    -   配置项
        -   **新** `css` - CSS 打包相关设置。详情请参见文档的 [配置](https://koot.js.org/#/config) 章节
        -   **新** `webpack.dll` - 开发模式下供 `webpack.DllPlugin` 使用。webpack 的监控不会处理这些库/library，以期提高开发模式的打包更新速度。详情请参见文档的 [配置](https://koot.js.org/#/config) 章节
        -   **新** `redux.syncCookie` - 允许服务器端在同构时将 `cookie` 中对应的项同步到 redux state 的 `server.cookie` 中。详情请参见文档的 [配置](https://koot.js.org/#/config) 章节
    -   生产模式
        -   使用 `koot-start` 命令时，如果打包过程发生错误，现在会显示更详细的错误记录
    -   开发模式
        -   现在可以同时启动多个 Koot 项目的开发模式了
        -   启用 `webpack` 热更新的 `多步骤 (multiStep)` 机制提高热更新速度
        -   启用 `webpack.DllPlugin` 提高打包更新速度
    -   分析模式
        -   输出的文件名结果现在具有可读性
    -   Webpack 打包
        -   重写 CSS 相关 `loader`，现在会确保同构结果中 CSS 样式名的正确性
        -   执行打包时会自动清理 `/logs/webpack-config/` 目录下创建于 2 天前的报告文件
        -   `/logs/webpack-config/` 目录下新生成的报告文件中，现在会正确的显示正则表达式
-   React
    -   高阶组件 `extend()`
        -   `pageinfo` 和 `data` 不再要求必须使用 `connect`
        -   使用新的 `context` 语法重写样式、CSS 相关逻辑
-   React 同构 (`ReactApp`)
    -   现在启动服务器时会对设定的端口进行检查。如果端口被占用，会报告相应的错误
    -   对于传入完整 `store` 的项目，现在每次请求时会尝试使用全新的 `state`
    -   优化服务器端初始化 `store` 的流程
-   错误修正
    -   修复生成了错误的多语言跳转 meta 链接地址的问题
    -   修正某些情况下 React 组件热更新不起作用的问题
-   添加依赖包
    -   `inquirer`
    -   `is-port-reachable`
    -   `portfinder`
-   移除依赖包
    -   `sp-css-loader`
-   更新依赖包
    -   major
        -   `sp-css-import` -> _4.0.0_
    -   minor
        -   `copy-webpack-plugin` -> _4.6.0_
        -   `webpack` -> _4.25.1_
    -   patch
        -   `@babel/core` -> _7.1.6_
        -   `@babel/plugin-proposal-decorators` -> _7.1.6_
        -   `@babel/preset-env` -> _7.1.6_
        -   `css-loader` -> _1.0.1_
        -   `fs-extra` -> _7.0.1_
        -   `postcss` -> _7.0.6_
        -   `react` -> _16.6.3_
        -   `react-dom` -> _16.6.3_
        -   `react-hot-loader` -> _4.3.12_
        -   `react-redux` -> \_5.1.1
        -   `sp-css-loader` -> _1.5.3_
        -   `yargs` -> _12.0.4_
-   其他
    -   更新测试项目和测试案例
    -   `koot-cli`
        -   更新项目到 v0.7 时，会自动添加兼容旧版规则的 `css` 配置
    -   `sp-css-import`
        -   更新核心代码，以兼容 koot v0.6 后的新结构
        -   使用新的 `context` 语法重写样式、CSS 相关逻辑

## 0.6.1

**2018-10-29**

-   错误修正
    -   修复打包时将 webpack 配置写入 log 文件的过程中的一处错误

## 0.6.0

**2018-10-29**

-   核心
    -   新的配置方式 `koot.config.js`
        -   整合原有的 `koot.js` 和 `koot.build.js`
        -   原有配置方式依旧可用
        -   请参照模板项目了解新的配置文件内容和写法
    -   项目配置
        -   `redux` 新增可选配置项 `store`
            -   项目自创建的 Redux store。提供该对象时，`redux.combineReducers` 配置项会被忽略
    -   开发模式
        -   启用 `babel-loader` 的缓存，加速热更新的响应速度
    -   Webpack
        -   写入打包配置记录文件时如果发生错误，现在会忽略该错误，并继续流程
-   React
    -   路由 (router) 移除配置外层包裹的空层级
    -   模板 (`ejs`) - 新语法 - `content(文件名)`
        <br>输出对应文件的文件内容到 HTML 代码中，如 `content('critical.css')` 会读取打包结果中的 `critical.css` 并渲染到 HTML 代码中 - `pathname(文件名)`
        <br>输出对应文件的访问地址到 HTML 代码中，如 `pathname('critical.css')` 会将打包结果中 `critical.css` 的 URL 访问地址渲染到 HTML 代码中 - 如果模板文件中针对 `critical` 使用上述新语法，则 `styles` 和 `scripts` 两个注入内容中不会出现 `critical` 的相关内容 - 模板项目已更新，可供参考
-   React 同构
    -   生产 (`prod`) 环境开启渲染缓存，缓存默认存在 **5 秒**
-   `sp-css-loader`
    -   开发模式下启用 CSS 样式名可读性规则：CSS 样式名以 `.[class]__component` 方式命名时，DOM 上的样式名会变为类似 `.nav__a8c0` 的结果
-   更新依赖包
    -   `react` -> _16.6.0_
    -   `react-dom` -> _16.6.0_
    -   `react-redux` -> _5.1.0_
    -   `webpack` -> _4.23.1_
    -   `webpack-dev-server` -> _3.1.10_
    -   `copy-webpack-plugin` -> _4.5.4_
    -   `autoprefixer` -> _9.3.1_

## 0.5.5

**2018-10-15**

-   核心
    -   Webpack
        -   `less-loader` 默认开启 Javascript 选项 (`javascriptEnabled`)

## 0.5.4

**2018-10-15**

-   React
    -   移除根层 `#root` 下的额外 `<div>`

## 0.5.2

**2018-10-12**

-   React
    -   高阶组件 `extend`
        -   `data` 可传入 _Function_，作为传统的 `data.fetch`
            -   该情况下，数据检查操作建议写在 redux action 中
        -   `data.fetch` 可传入 _Array_，核心代码会自动执行 `Promise.all()`

## 0.5.1

**2018-10-11**

-   错误修正
    -   `pageinfo` 移除已有 `meta` 标签时遇到 `undefined` 时全局报错的问题

## 0.5.0

**2018-10-11**

-   核心
    -   为避免版本冲突，将所有 NPM 依赖包的版本改为固定版本
-   开发模式 (`koot-dev`)
    -   新的命令选项 `--no-open`：禁用自动打开浏览器
    -   针对 React 组件自动启用热更新
        -   注意事项请参见文档的 [React 组件热更新](https://koot.js.org/react-hmr) 章节
-   React 同构 (`ReactApp`)
    -   新的高阶组件 `extend`
        -   `import { extend } from 'koot'`
        -   可作为组件装饰器使用
        -   提供同构数据功能
        -   包含 `pageinfo` 和 `ImportStyle` 功能
        -   具体用法请参见文档的 [React 高阶组件](https://koot.js.org/react-hoc) 章节
    -   优化 CSS 处理相关流程
    -   开发模式
        -   页面可访问静态资源文件目录中的内容
-   错误修正
    -   浏览器环境 (`__CLIENT__`) 中使用 `utils/get-port` 方法无结果的问题

## 0.4.3

**2018-09-18**

-   **ReactApp** (React 同构)
    -   开发模式：重写可使用本机 IP 地址访问的功能，现在会适应更多场景

## 0.4.2

**2018-09-18**

-   打包配置 (`/koot.build.js`)
    -   新增选项：`staticAssets`
        -   静态资源文件存放路径，打包时会自动复制该目录下的所有文件到打包目录下，方便直接使用

## 0.4.1

**2018-09-17**

-   `koot-analyze` 命令现在不会生成 `service-worker` 文件
-   **ReactApp** (React 同构)
    -   开发模式：可使用本机 IP 地址访问

## 0.4.0

**2018-09-17**

-   启用命令: `koot-analyze`

## 0.3.2

**2018-09-14**

-   错误修正
    -   开发模式不会实时响应语言包文件更新的问题

## 0.3.1

**2018-09-14**

-   错误修正
    -   开发模式不断重启的问题

## 0.3.0

**2018-09-14**

-   **ReactApp** (React 同构)
    -   当多语言（i18n）启用时，在 `<head>` 中自动生成跳转到相应的其他语种的链接的 `<link>` 标签
-   内部代码
    -   `hl` 修改为全局常量

## 0.2.4

**2018-09-14**

-   依赖库
    -   添加：`@babel/plugin-syntax-dynamic-import`

## 0.2.3

**2018-09-12**

-   生成 Webpack 配置
    -   完善：忽略值为 `null` `undefined` 等空值的插件项

## 0.2.2

**2018-09-12**

-   生成 Webpack 配置
    -   忽略值为 `null` `undefined` 等空值的插件项

## 0.2.1

**2018-09-11**

-   错误修正
    -   启动开发模式时生成名为 `1.json` 文件的问题

## 0.2.0

**2018-09-10**

-   更新 `babel` 至 v7
-   新增单元测试
    1. 生成 Webpack 配置
    2. Webpack 打包流程

## 0.1.0

**2018-08-24**

-   更名至 `koot`
-   重置版本号

---

更名至 `koot`

---

## 3.0.7-alpha.31

**2018-06-19**

-   可直接通过 `super-project` 载入内容
    -   用法示例：`import { store, history } from 'super-project'`)
    -   当前可用内容
        -   `store` - Redux store
        -   `history` - 路由与历史记录对象，包含 `push`、`replace` 等方法
        -   `localeId` - (仅在 i18n 开启时可用) 当前语种 ID
        -   `pageinfo` - (原 `super-ui-page`) 更新页面 `title` 和 `meta` 的装饰器
-   移除 `super-ui-page` 依赖
    -   原有的 `superPage` 移动到 `super-project` 主包中
    -   更名为 `pageinfo`

## 2.4.0

2018-02-11

-   新增文件 `CHANGELOG.md`
-   更新依赖库
-   `sp-isomorphic-utils`
    -   `getFile`: 如果根据文件名直接匹配到目标文件，直接返回该文件名，不再继续进行文件夹内过滤
-   `sp-pwa`
    -   `create`: 创建 service-worker 时，新增参数 `outputFilenameHash`，表示创建的 sw 文件名中带有 hash，默认为 `false`
        -   当前的 service-worker 规范中，浏览器不会对 sw 文件进行缓存，每次访问页面时都会尝试重新获取 sw 文件
    -   `get-service-worker-file`: 更新到最新的 `getFile()` 方法
