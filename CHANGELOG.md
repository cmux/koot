## [Unreleased]

**koot**

-   **重大改动**
    -   此次更新包含诸多重大改动，对于已有项目的升级，请参阅[升级指南](https://koot.js.org/#/migration/0.14-to-0.15)
    -   _Node.js_ 最低版本要求提升到 `12.0.0`
    -   更新依赖包 **major** 版本号
        -   `commander` -> _^7.2.0_
        -   `glob-promise` -> _^4.0.1_
        -   `execa` -> _^5.0.0_
        -   `koa-convert` -> _^2.0.0_
        -   `koa-helmet` -> _^6.1.0_
        -   `koa-router` -> _^10.0.0_
        -   `react` -> _^17.0.2_
        -   `react-dom` -> _^17.0.2_
        -   `typescript` -> _^4.2.4_
    -   移除以下依赖包，现在不会默认安装。如有使用需要，请在项目中自行安装
        -   `get-image-colors`
        -   `isomorphic-fetch`
        -   `yargs`
-   **新特性**
    -   现已支持全新的 _JSX_ 转译引擎 ([#282](https://github.com/cmux/koot/issues/282))
        -   该功能对从 0.15 之前版本升级而来的项目默认关闭，如需开启请参阅[升级指南](https://koot.js.org/#/migration/0.14-to-0.15)
        -   使用 `koot-cli` 创建的新项目会使用该新特性
        -   相关信息请查阅 [React 官方文档](https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html)
    -   **新配置项** `beforeBuild` - 生命周期方法: 打包即将开始时 ([#288](https://github.com/cmux/koot/issues/288))
        -   详情请参见文档 [生命周期](https://koot.js.org/#/life-cycle?id=打包)
    -   **新配置项** `afterBuild` - 生命周期方法: 打包刚刚完成时 ([#288](https://github.com/cmux/koot/issues/288))
        -   详情请参见文档 [生命周期](https://koot.js.org/#/life-cycle?id=打包)
    -   在进行打包、启动开发环境之前，现在会进行 _Node.js_ 版本检查，如果不通过，会终止流程 ([#274](https://github.com/cmux/koot/issues/274))
    -   _React_ 热更新现在改用官方的 _Fast Refresh_ 机制，理论上热更新效率会有提升，原则上对已有项目不会造成影响。相关信息请查阅 [React 官方讨论帖](https://github.com/facebook/react/issues/16604)
-   优化
    -   `serviceWorker` 的 `cacheFirst` `networkFirst` `networkOnly` 扩展缓存策略选项，其数组 (`Array`) 内现在可以直接传入正则表达式和用以分析请求的函数，请参见文档 [Service Worker/扩展缓存规则](/pwa?id=扩展缓存规则)
    -   SSR 项目
        -   渲染缓存的 `get` 和 `set` 方法现在均新增一个参数，值为本次请求的 _KOA Context_ ([#294](https://github.com/cmux/koot/issues/294))
    -   SPA 项目
        -   打包结果中附带的简易服务器现在支持 `serverBefore` 和 `serverAfter` 生命周期 ([#292](https://github.com/cmux/koot/issues/292))
-   错误修正
    -   修复在 `extend()` 高阶组件的 `pageinfo` 方法没有返回 `title` 时，页面标题被清空的问题
    -   修复在 SPA 项目中如果没有启用多语言，初次访问开发环境时会报告 _Redux_ 相关错误，提示无法辨识的 _Key_ 的问题 ([#230](https://github.com/cmux/koot/issues/230))
    -   修复在 SPA 项目中如果设定了 `historyType` 为 `browser` 同时 _Webpack_ 配置中设定了 `output.publicPath`，后者不生效的问题 ([#249](https://github.com/cmux/koot/issues/249))
-   添加依赖包
    -   `cli-table`
    -   `filesize`

**koot-electron**

-   **重大改动**
    -   更新依赖包 **major** 版本号
        -   `electron` -> _^12.0.5_

**koot-webpack**

-   **重大改动**
    -   此次更新包含诸多重大改动，对于已有项目的升级，请参阅[升级指南](https://koot.js.org/#/migration/0.14-to-0.15)
    -   内置的多语言处理方式改为 _Babel_ 插件，原 _Webpack_ 插件现已弃用 ([#215](https://github.com/cmux/koot/issues/215))
    -   移除 _CSS_ 处理时的 `universal-alias-loader` 逻辑
        -   新版 _Webpack_ 已默认支持 `css-loader` 使用 `resolve.alias` 配置，该 _Loader_ 不再需要
    -   更新依赖包 **major** 版本号
        -   `@hot-loader/react-dom` -> _^17.0.0_
        -   `compression-webpack-plugin` -> _^7.1.2_
        -   `copy-webpack-plugin` -> _^8.1.1_
        -   `css-loader` -> _^5.2.4_
        -   `less` -> _^4.1.1_
        -   `less-loader` -> _^8.1.1_
        -   `mini-css-extract-plugin` -> _^1.5.0_
        -   `postcss` -> _^8.2.13_ ([#285](https://github.com/cmux/koot/issues/285))
        -   `postcss-loader` -> _^5.2.0_
        -   `sass-loader` -> _^11.0.0_
        -   `style-loader` -> _^2.0.0_
        -   `thread-loader` -> _^3.0.3_
        -   `webpack` -> _^5.36.0_ ([#215](https://github.com/cmux/koot/issues/215))
        -   `webpack-bundle-analyzer` -> _^4.4.1_
        -   `webpack-dev-middleware` -> _^4.0.4_
        -   `workbox-webpack-plugin` -> _^6.1.5_
    -   移除以下依赖包，现在不会默认安装，已无需要
        -   `@diablohu/hard-source-webpack-plugin`
        -   `@hot-loader/react-dom`
        -   `react-hot-loader`
-   添加依赖包
    -   `@babel/plugin-proposal-nullish-coalescing-operator`
    -   `@babel/plugin-proposal-optional-chaining`
    -   `@pmmmwh/react-refresh-webpack-plugin`

---

## [0.14.12] - 2021-01-17

**koot**

-   修正: 无法正确的处理图标文件的问题

## [0.14.11] - 2021-01-15

**koot**

-   优化: SSR 服务器报错机制

## [0.14.10] - 2020-12-30

**koot-cli**

-   错误修正
    -   针对最新的项目模板，修正 `serverless` 和 `electron` 相关配置没有自动添加的问题

## [0.14.9] - 2020-09-22

**koot**

-   优化
    -   针对使用 `hashHistory` 的 SPA 项目，现在确保默认的 _Service Worker_ 作用域 (Scope) 为当前路径 (`location.pathname`)

## [0.14.8] - 2020-09-22

**koot**

-   优化
    -   如果 `sharp` 安装失败，现在会给出 _WARNING_ 而非 _ERROR_，打包流程会正常进行

## [0.14.6] - 2020-09-17

**koot**

-   优化
    -   更新 TS 定义

## [0.14.5] - 2020-09-11

**koot** & **koot-webpack**

-   优化
    -   利用默认的 _Webpack_ 优化 (`optimization` 和 DLL 相关) 设置时，优化使用 _Ant Design_ v4 的项目的开发环境热更新速度以及生产环境的拆包策略

## [0.14.4] - 2020-08-20

**koot**

-   错误修正
    -   修正某些情况下客户端开发环境中，多语言翻译函数 (`__()`) 不可用的问题

## [0.14.3] - 2020-08-20

**koot**

-   优化
    -   更新 TS 定义

## [0.14.2] - 2020-08-17

**koot**

-   优化
    -   优化 `name` 配置项默认值的生成方式
    -   现在 `extend()` 高阶组件中，在使用 `pageinfo` 时如果没有 `title` 属性，会默认采用 `name` 配置值
-   错误修正
    -   更正 NPM 命令入口文件的换行符，以确保 Yarn 能正常使用 ([#270](https://github.com/cmux/koot/issues/270))

## [0.14.0] - 2020-08-12

_Koot.js_ 0.14 开始原生支持 _Electron_ 项目开发。利用 `koot-cli` 创建新项目时可以根据向导直接创建 _Electron_ 项目并会自动配置完成开发环境。如需手动配置开发环境，如从老的 _Koot.js_ 项目升级，请参见文档 [Electron](https://koot.js.org/#/electron) ([#102](https://github.com/cmux/koot/issues/102))。

**koot**

-   **重大改动**
    -   _Node.js_ 最低版本要求提升到 `10.13.0`
    -   更新依赖包 **major** 版本号
        -   `commander` -> _^6.0.3_
        -   `execa` -> _^4.0.0_
        -   `fs-extra` -> _^9.0.0_
        -   `react-redux` -> _^7.2.0_ ([#45](https://github.com/cmux/koot/issues/45), [#154](https://github.com/cmux/koot/issues/154))
    -   移除以下依赖包，现在不会默认安装。如有使用需要，请在项目中自行安装
        -   `md5-file`
    -   为日后预计开发的某项功能做准备，现在客户端/浏览器端生成路由对象的流程会采用 _Promise_ 异步方式，原则上对已有项目不会造成影响
    -   移除环境变量 `precess.env.KOOT_SERVER_MODE`，相关能力整合入新的环境变量 `process.env.KOOT_BUILD_TARGET`
-   **新特性**
    -   **新配置项** `target` - 设定项目子类型，目前支持
        -   `serverless` - 仅针对 SSR 项目。替代之前的 `serverless = true'` 配置
        -   `electron` - 仅针对 SPA 项目
        -   详情请参见文档 [配置/target](https://koot.js.org/#/config?id=target)
    -   **新配置项** `icon` - 项目图标配置
    -   **新配置项** `webApp` - WebApp / PWA 相关设置
        -   在设定了 App 图标 (icon 设置项) 时，Koot.js 会默认自动在生成、渲染的 HTML 代码结果中加入 WebApp 相关的 `<meta>` 和 `<link>` 标签
        -   详情请参见文档 [WebApp](https://koot.js.org/#/pwa?id=webapp)
    -   多语言/i18n: `i18n.use = 'subdomain'` - 现在可使用最深层的子域名作为语言标识 ([#220](https://github.com/cmux/koot/issues/220))
-   优化
    -   小幅优化热更新速度 (移除多余的 `webpack/hot` 和 `webpack-dev-server/client` 引用)
-   添加依赖包
    -   `favicons`
    -   `get-image-colors`
    -   `sharp`

**koot-boilerplate**

-   优化
    -   _PostCSS_ 配置中 `cssnano` 插件配置调整: 禁用 `normalizeWhitespace`

**koot-webpack**

-   **重大改动**
    -   更新依赖包 **major** 版本号
        -   `compression-webpack-plugin` -> _^4.0.0_
        -   `copy-webpack-plugin` -> _^6.0.3_
        -   `css-loader` -> _^4.2.0_
        -   `less-loader` -> _^6.2.0_
        -   `sass-loader` -> _^9.0.2_
    -   移除以下依赖包，现在不会默认安装。如有使用需要，请在项目中自行安装
        -   `node-sass` - 替换为 `sass`
    -   如果 `defines` 定义项目为函数，现在会传入属性对象作为第一个参数，目前包含 `localeId`
-   添加依赖包
    -   `sass`

**koot-cli**

-   **重大改动**
    -   _Node.js_ 最低版本要求提升到 `10.13.0`

**koot-electron**

-   新的 NPM 包，包含 _Electron_ 项目开发相关内容。参见文档 [Electron](https://koot.js.org/#/electron)

---

## [0.13.29] - 2020-07-21

**koot-webpack**

-   优化缓存策略，现在会忽略部分不必要的环境变量 ([#265](https://github.com/cmux/koot/issues/265))

## [0.13.28] - 2020-06-19

**koot-webpack**

-   优化缓存策略，现在会考虑环境变量的区别 ([#262](https://github.com/cmux/koot/issues/262))

## [0.13.27] - 2020-06-03

**koot**

-   优化
    -   继续优化有关 SPA 项目的 Service Worker 配置和 _Workbox_ 模板
        -   如果提供了 `scope`，缓存空间命名会自动调整，以防冲突

## [0.13.26] - 2020-06-03

**koot**

-   优化
    -   继续优化有关 SPA 项目的 Service Worker 配置和 _Workbox_ 模板

## [0.13.25] - 2020-06-02

**koot-webpack**

-   优化
    -   更新自带的 _Workbox_ 模板，优化在子目录中的项目的表现（通常是 SPA 项目）

## [0.13.24] - 2020-05-17

**koot-webpack**

-   优化
    -   SPA 项目页面中现在会加入跳转到其他语种的链接的 `<meta>` 标签

## [0.13.23] - 2020-05-11

**koot-webpack**

-   优化
    -   `hard-source-webpack-plugin` 改为使用 `hard-source-webpack-plugin-fixed-hashbug`，以解决打包时偶发的缓存 hash 错误现象 ([#241](https://github.com/cmux/koot/issues/241))

## [0.13.22] - 2020-04-29

**koot-webpack**

-   优化
    -   `RUN_FIRST` 入口文件现在不会参与 _Webpack_ 的 _optimization_ 优化流程
        -   该改动为了减少一些极端情况问题的发生

## [0.13.21] - 2020-04-28

**koot**

-   **新特性**
    -   **新配置项** `moduleCssFilenameTest` - 现在支持传入 _Array_，另外每一个条目也支持传入结构为 _Webpack_ `module.rule` 的 _Object_。详情请参见文档 [CSS/相关配置](https://koot.js.org/#/css?id=相关配置)

## [0.13.20] - 2020-04-24

**koot**

-   **新特性**
    -   **新配置项** `serviceWorker.scope` - 自动注册 _Service Worker_ 的作用域。详情请参见文档 [Service Worker/选项](https://koot.js.org/#/pwa?id=service-worker)
-   优化
    -   SPA 项目中，默认的 _Service Worker_ 注册流程里，默认请求地址调整为相对路径，`scope` 调整为空

## [0.13.19] - 2020-04-20

**koot**

-   错误修正
    -   SSR 多语言渲染不正确的一处问题

## [0.13.18] - 2020-04-17

**koot**

-   优化
    -   更新开发环境客户端打包的 DLL 默认组件列表
-   错误修正
    -   启动 SSR 服务器时，如果采用 `--expose gc` 命令，无法进行渲染的问题

## [0.13.17] - 2020-04-17

**koot**

-   错误修正
    -   SSR 时基础目录 (`global.KOOT_DIST_DIR`) 指定错误的问题

## [0.13.16] - 2020-04-16

**koot**

-   优化
    -   优化 SSR _Store_ 处理

## [0.13.15] - 2020-04-15

**koot**

-   优化
    -   综合优化 SSR 服务器内存溢出现象

## [0.13.14] - 2020-04-13

**koot**

-   优化
    -   进一步优化 `serverPackAll = true` 时的 SSR 服务器内存溢出现象

## [0.13.13] - 2020-04-08

**koot**

-   修正 `CRLF` 问题，重新发布

## [0.13.12] - 2020-04-08

**koot**

-   优化
    -   优化 SSR 服务器内存溢出现象

## [0.13.11] - 2020-04-01

**koot**

-   错误修正
    -   开发环境中多语言相关的服务器跳转地址为 `https://` 的问题 ([#232](https://github.com/cmux/koot/issues/232))
        -   开发环境中的相关跳转地址现在会无视 `proxyRequestOrigin.protocol` 配置项，强制为 `http://`
    -   开发环境中组件热更新时会重新挂载 (re-mount) 的问题 ([#233](https://github.com/cmux/koot/issues/233))

## [0.13.10] - 2020-03-25

**koot**

-   错误修正
    -   潜在的开发环境中的部分静态文件无法请求的问题
    -   SPA 项目在某些情况下静态资源打包路径错误的问题

## [0.13.9] - 2020-03-24

**koot**

-   优化
    -   启动开发环境时的自动询问等待时间提高到 10 秒

## [0.13.8] - 2020-03-19

**koot**

-   优化
    -   启动开发环境时，会询问是否自动打开浏览器访问页面 ([#218](https://github.com/cmux/koot/issues/218))

## [0.13.7] - 2020-03-17

**koot**

-   **新特性**
    -   多语言/i18n: 语言包现在可以使用 _JavaScript_ 文件了。(仅限使用 `module.exports` 方式输出的 JS 文件) ([#216](https://github.com/cmux/koot/issues/216))
-   错误修正
    -   SPA 项目中 CSS 引用资源文件的 URL 错误问题

**koot-boilerplate** (模板项目)

-   优化 loader 配置

## [0.13.5 & 0.13.6] - 2020-03-16

**koot-cli**

-   更新创建项目流程，同时新增以下选择
    -   项目类型
    -   服务器模式
    -   项目代码所在目录
    -   包管理器
-   创建项目时会自动使用选择的包管理器安装依赖

## [0.13.4] - 2020-03-13

**koot**

-   **新特性**
    -   **新配置项** `serverPackAll` - 针对 SSR 项目的服务器打包，设定是否打入所有 _Module_。详情请参见文档 [配置/serverPackAll](https://koot.js.org/#/config?id=serverPackAll)

## [0.13.3] - 2020-03-11

**koot**

-   优化
    -   SSR: 服务器打包结果中会包含所有的模块

## [0.13.2] - 2020-03-10

**koot**

-   优化
    -   SPA: 进一步优化多语言可靠性

## [0.13.1] - 2020-03-10

**koot**

-   优化
    -   SPA: 进一步优化多语言可靠性

**koot-boilerplate** (模板项目)

-   更新 _VS Code_ 中有关 _ESLint_ 的配置
-   更新 SPA 多语言相关代码

## [0.13.0] - 2020-03-05

-   更新依赖包 minor 和 patch 版本号

**koot**

-   **重大改动**
    -   调整客户端打包结果目录结构
        -   不再有 `koot-[timestamp]` 目录
        -   现在会智能的根据 `bundleVersionsKeep` 配置项删除旧的文件
        -   打包结果根目录中新增 `.koot-public-outputs.json` 文件，用以记录旧的打包文件列表
        -   `.public-chunkmap.json` 更名为 `.koot-public-manifest.json`
        -   打包结果目录内的文件结构会受影响，但不影响使用
        -   如果项目中有针对打包结果目录内文件的处理，请注意
        -   更多细节请参见文档 [Webpack](https://koot.js.org/#/webpack)
-   **新特性**
    -   **新配置项** `serverless` - 设定是否输出 _Serverless_ 模式的 _Web_ 服务器。详情请参见文档 [配置/serverless](https://koot.js.org/#/config?id=serverless) ([#217](https://github.com/cmux/koot/issues/217))
    -   **新配置项** `exportGzip` - 控制是否自动输出 _Gzip_ 压缩后的 `*.gz` 文件。详情请参见文档 [Webpack](https://koot.js.org/#/webpack)
    -   同构/SSR 项目: 打包结果根目录中添加 _Docker_ 相关的文件
-   优化
    -   `serviceWorker` 配置项新增 `cacheFirst` `networkFirst` `networkOnly` 属性，可用扩展缓存策略。详情请参见文档 [Service Worker](https://koot.js.org/#/pwa?id=service-worker)
    -   优化 _Service Worker_ 的默认缓存规则。详情请参见文档 [Service Worker](https://koot.js.org/#/pwa?id=service-worker)
    -   服务器端渲染时，现在会利用自定义的 `publicPath`
    -   SPA: 确保 _React_ 渲染时语言包可用
    -   更新 TS 定义

**koot-boilerplate** (模板项目)

-   添加 `.prettierignore` 文件

**koot-webpack**

-   优化打包缓存机制，现在生产环境下的打包速度会更快 ([#214](https://github.com/cmux/koot/issues/214))
-   同构/SSR 项目: 打包结果目录中的 `package.json` 中现在会有更少的依赖项
-   服务器端打包时现在会强制忽略以下 _Babel_ 插件，用以实现原生的 _async/await_
    -   `@babel/plugin-transform-regenerator`
    -   `@babel/plugin-transform-async-to-generator`

---

## [0.12.8] - 2021-01-27

**koot-webpack**

-   错误修正
    -   某些情况下 SPA 项目无法打包的问题 (该问题已在后续版本中修正，本次修正仅针对 0.12 版本分支)

## [0.12.7] - 2020-03-02

**koot**

-   错误修正
    -   打包出错时的无效错误提示

## [0.12.6] - 2020-02-15

**koot**

-   优化
    -   工具函数 `getPort` 现在明确会返回 Web Server 端口号 ([#210](https://github.com/cmux/koot/issues/210))

## [0.12.5] - 2020-02-13

-   更新依赖包 minor 和 patch 版本号

**koot**

-   **新特性**
    -   **新配置项** `devServiceWorker` - 设定开发环境中是否应用 _Service Worker_。详情请参见文档 [配置/devServiceWorker](https://koot.js.org/#/config?id=devServiceWorker) ([#211](https://github.com/cmux/koot/issues/211))

## [0.12.4] - 2020-02-11

-   更新依赖包 minor 和 patch 版本号

**koot**

-   错误修正
    -   修正 SPA 项目禁用多语言时无法正常运行的问题 ([#212](https://github.com/cmux/koot/issues/212))

## [0.12.3] - 2020-02-07

**koot**

-   **重大改动**
    -   SPA 项目现在支持多语言开发
        -   打包类型强制为 `store`

## [0.12.2] - 2020-02-05

-   更新依赖包 minor 和 patch 版本号

**koot**

-   优化
    -   `extend()` 高阶组件现在会正确的向目标组件传入 `forwardedRef` 属性 ([#206](https://github.com/cmux/koot/issues/206))
    -   现在重新允许 _Babel_ 插件 `@babel/plugin-transform-regenerator` (撤回 0.12.0 的一项改动)
        -   为保证最大兼容
        -   打包的代码量会比之前稍大一些

## [0.12.1] - 2020-02-03

-   更新依赖包 minor 和 patch 版本号

**koot**

-   **重大改动**
    -   更新依赖包 **major** 版本号
        -   `workbox` -> _^5.0.0_
-   优化
    -   现在 `serviceWorker` 配置项允许传入所有 _Workbox_ 可接受的选项 ([#209](https://github.com/cmux/koot/issues/209))

## [0.12.0] - 2020-01-13

-   更新依赖包 minor 和 patch 版本号

**koot**

-   **重大改动**
    -   _Node.js_ 最低版本要求提升到 `8.12.0`
    -   SSR & 客户端渲染 & SPA 模板生成
        -   组件 CSS 的 `<style>` 标签上不再有 `id` 属性，以避免和元素冲突
            -   如果项目中有用到根据 `id` 选择 `<style>` 标签的场景，可改为选择标签属性 `[data-koot-module]`
        -   特殊 JS 入口 _CLIENT_RUN_FIRST_ 如果文件尺寸大于 10KB，会改为引用请求的方式加载
    -   默认的 _Service Worker_ 文件现在使用 _Workbox_ 生成
        -   如果原有项目中有使用自定的 _Service Worker_ 模板，升级后需要更新该模板。详情请参见文档 [Service Worker](https://koot.js.org/#/pwa)
    -   现在会忽略 _Babel_ 插件 `@babel/plugin-transform-regenerator`
    -   现在默认不会安装以下依赖包，如有使用需要，请在项目中自行安装
        -   `file-loader`
        -   `html-webpack-plugin`
        -   `json-loader`
        -   `url-loader`
    -   更新依赖包 **major** 版本号
        -   `chalk` -> _^3.0.0_
        -   `ejs` -> _^3.0.1_
        -   `ora` -> _^4.0.3_
-   **新特性**
    -   现在默认支持在浏览器环境中使用 _async_ / _await_ 开发
    -   客户端打包现在会默认提供 `optimization` 配置，进行代码拆分
        -   已有项目如无特殊需求，可将 `optimization` 配置移除
    -   现在开发环境下会默认启用 _Service Worker_
    -   **新配置项** `distClientAssetsDirName` - 设定客户端打包结果中静态资源存放路径的目录名。详情请参见文档 [配置/distClientAssetsDirName](https://koot.js.org/#/config?id=distClientAssetsDirName) ([#181](https://github.com/cmux/koot/issues/181))
    -   **新全局函数** `getCtx` - 获取服务器的 _Koa ctx_ 对象。具体用法请参见文档 [全局与工具函数/全局函数](https://koot.js.org/#/utilities?id=全局函数) ([#196](https://github.com/cmux/koot/issues/196))
    -   **新工具函数** `koot/utils/client-get-styles` - 获取当前全局 CSS 和所有组件 CSS。具体用法请参见文档 [全局与工具函数/工具函数/客户端](https://koot.js.org/#/utilities?id=仅客户端) ([#185](https://github.com/cmux/koot/issues/185))
    -   **新工具函数** `koot/utils/webpack-optimization-prod` - 生成 Webpack `optimization` 配置，用于拆分代码。具体用法请参见文档 [全局与工具函数/工具函数/打包](https://koot.js.org/#/utilities?id=仅打包)
-   优化
    -   SSR & 客户端渲染 & SPA 模板生成
        -   所有注入/插入的 `<script>` 标签现在均会新增 `[data-koot-entry]` 属性
        -   特殊 JS 入口 `_CLIENT_RUN_FIRST_` 现默认引入 `regenerator-runtime/runtime`
    -   更新 TS 定义 ([#191](https://github.com/cmux/koot/issues/191))
    -   多语言 / i18n
        -   优化语言包匹配逻辑 ([#201](https://github.com/cmux/koot/issues/201)) ([#203](https://github.com/cmux/koot/issues/203))
        -   如果翻译函数 (`__()`) 获得了确定的结果，函数会被自动转换成字符串 ([#187](https://github.com/cmux/koot/issues/187))
    -   服务器
        -   优化服务器代码的文件尺寸 ([#172](https://github.com/cmux/koot/issues/172), [#186](https://github.com/cmux/koot/issues/186))
        -   如果 URL 中开头的斜线 `/` 过多，现在会自动跳转到正确的 URL ([#157](https://github.com/cmux/koot/issues/157))
    -   `node-sass` 现在改为 `optionalDependencies`，如果安装失败，不会影响 _Koot.js_ 的安装
    -   组件 CSS 文件现在会按照 _ES Module_ 格式输出
        -   现在同时支持 _ES Module_ 和 _CommonJS_ 引用方式
    -   优化打包和进入开发环境时的错误日志显示
    -   使用 `import()` 时，如果 `webpackChunkName` 注释选项中包含特殊字符，现在会自动转换为文件名安全的字符 ([#190](https://github.com/cmux/koot/issues/190))
    -   扩充配置 `devDll` ([#202](https://github.com/cmux/koot/issues/202))
-   错误修正
    -   客户端生命周期 `before()` 和 `after()` 现在会传入正确的参数 ([#198](https://github.com/cmux/koot/issues/198))

**koot-boilerplate**

-   _Node.js_ 最低版本要求提升到 `10.13.0`
-   _Webpack_ 配置
    -   图片资源改用 `url-loader` 处理
        -   大于 **2KB** 的文件会继续使用 `file-loader` 处理
    -   大于 **5KB** 的 _SVG_ 的文件会改用 `file-loader` 处理
    -   优化生产环境的代码分割规则
-   新命令 `yarn up` - 使用 _Yarn_ 检查本地依赖版本并选择更新
    -   该命令要求使用 _Yarn_ 进行本地包管理

**koot-cli**

-   错误修正
    -   新建项目时的“覆盖”模式会删除原有文件的问题 ([#180](https://github.com/cmux/koot/issues/180))

## [0.11.15] - 2019-10-15

-   更新依赖包 minor 和 patch 版本号

**koot**

-   优化
    -   现在可零配置正常使用 _SASS_ 了 ([#179](https://github.com/cmux/koot/issues/179))
-   错误修正
    -   SPA 项目无法使用 `analyze` 命令的问题

## [0.11.14] - 2019-09-29

-   更新依赖包 minor 和 patch 版本号

**koot**

-   错误修正
    -   `store` 选项指向的文件在客户端被引用多次的问题

## [0.11.13] - 2019-09-26

-   更新依赖包 minor 和 patch 版本号

**koot**

-   错误修正
    -   `cookiesToStore` 为 `'all'` 时，部分带有 `=` 的值处理错误 ([#177](https://github.com/cmux/koot/issues/177))

**koot-boilerplate**

-   为日文添加更合适的字体
-   错误修正
    -   _EJS_ 模板中 `lang` 属性位置不正确的问题

## [0.11.12] - 2019-09-25

**koot**

-   更新 TS 定义
-   错误修正
    -   SSR 服务器环境 _Store_ 中的有关路由信息错误 ([#178](https://github.com/cmux/koot/issues/178))

## [0.11.11] - 2019-09-24

-   更新依赖包 minor 和 patch 版本号

**koot**

-   更新 TS 定义
    -   注：所有类组件 (_Class Component_) 的 `render()` 方法返回值类型需更改为 `React.ReactNode`

## [0.11.10] - 2019-09-20

**koot**

-   优化
    -   通过配置 `devServer.proxy`，SSR 项目的开发环境中，现在可以使用 _webpack-dev-server_ 的 `proxy` 能力了 ([#176](https://github.com/cmux/koot/issues/176))

## [0.11.9] - 2019-09-19

**koot**

-   优化
    -   调整开发环境的关闭流程
-   错误修正
    -   开发环境 _source map_ 不正确的问题 ([#175](https://github.com/cmux/koot/issues/175))

**koot-boilerplate**

-   添加 `.eslintignore` 和 `.prettierignore`

## [0.11.8] - 2019-09-17

**koot**

-   优化
    -   开发环境服务器现在会尝试自动重启
-   更新依赖包 minor 和 patch 版本号

**koot-boilerplate**

-   调整默认字体 `font-family`

## [0.11.7] - 2019-09-10

核心

-   更新 TS 定义
-   更新依赖包 minor 和 patch 版本号
    -   `babel` 和相关依赖包 -> _7.6.0_

## [0.11.6] - 2019-09-05

核心

-   更新 TS 定义
-   更新依赖包 patch 版本号

## [0.11.5] - 2019-08-30

核心

-   更新 TS 定义

## [0.11.4] - 2019-08-30

核心

-   更新依赖包
    -   major
        -   `inquirer` -> _7.0.0_
        -   `sass-loader` -> _8.0.0_
    -   minor
        -   `typescript` -> _3.6.2_
    -   patch
        -   `@types/node` -> _12.7.3_
        -   `@types/webpack` -> _4.39.1_
        -   `react-hot-loader` -> _4.12.12_
        -   `webpack` -> _4.39.3_

**koot-cli**

-   更新依赖包
    -   major
        -   `inquirer` -> _7.0.0_

## [0.11.3] - 2019-08-29

核心

-   **错误修正**
    -   修正：SSR 预渲染后 _Store_ state 中的 `routing` 属性被清空

## [0.11.2] - 2019-08-28

核心

-   **优化**
    -   更新 TS 定义

## [0.11.1] - 2019-08-27

核心

-   **优化**
    -   `extend()` 高阶组件，如果传入了 `pageinfo`，在组件挂载 (`componentDidMount`) 延迟 500ms 后，会再次自动执行一次 `updatePageinfo`

## [0.11.0] - 2019-08-23

核心

-   **重大改动**
    -   同构/SSR 项目
        -   SSR 流程和生命周期调整，原则上对已有项目不会造成影响。如果升级 _Koot.js_ 后 SSR 出现异常，请查阅: [升级指南: 0.10 -> 0.11](https://koot.js.org/#/migration/0.10-to-0.11)
        -   渲染缓存 (RenderCache) 默认禁用，如需继续使用，请配置 `renderCache`，配置方式请查阅 [项目配置/renderCache](https://koot.js.org/#/config?id=renderCache)
-   **新特性**
    -   **新全局函数** `getCache()` - 获取公用缓存空间。具体用法请参见文档 [全局与工具函数/全局函数](https://koot.js.org/#/utilities?id=全局函数) ([#143](https://github.com/cmux/koot/issues/143))
    -   **新工具函数** `clientUpdatePageinfo()` - 更新页面标题 `<title>` 和 `<meta>` 标签。具体用法请参见文档 [全局与工具函数/工具函数](https://koot.js.org/#/utilities?id=工具函数) ([#143](https://github.com/cmux/koot/issues/163))
    -   **新服务器端生命周期** `beforePreRender()` - 在预渲染之前之情。具体用法请参见文档 [生命周期/服务器端](https://koot.js.org/#/life-cycle?id=服务器端)
    -   现在会自动为客户端打包结果中的部分资源文件生成 gzip 版本 (.gz 文件) ([#129](https://github.com/cmux/koot/issues/129))
-   **优化**
    -   `createStore()` 全局函数现允许传入 store 增强函数 (enhancer)。详情请参见文档 [Store/全局函数 createStore](https://koot.js.org/#/store?id=全局函数-createstore) ([#144](https://github.com/cmux/koot/issues/144))
    -   多语言翻译函数 (`__()`) 现支持返回一个对象或数组
    -   `service-worker` 对首页的缓存处理
    -   SSR
        -   _服务器端_: 现支持有超大型语言包的项目 ([#145](https://github.com/cmux/koot/issues/145))
    -   开发环境
        -   _客户端_: 减少部分初始的日志输出
    -   Webpack
        -   `koot-css-loader`
            -   现支持更多的 URL 引用写法
            -   针对相对路径的引用进行优化
-   添加依赖包
    -   `@types/webpack`
    -   `compression-webpack-plugin`
-   更新依赖包
    -   major
        -   `commander` -> _3.0.0_
        -   `koa-helmet` -> _5.0.0_
        -   `rimraf` -> _3.0.0_
        -   `style-loader` -> _1.0.0_
        -   `yargs` -> _14.0.0_
    -   minor
        -   `@babel/register` -> _7.5.5_
        -   `@hot-loader/react-dom` -> _16.9.0_
        -   `@types/node` -> _12.7.2_
        -   `@types/react` -> _16.9.2_
        -   `@types/react-dom` -> _16.9.0_
        -   `@types/webpack` -> _4.39.0_
        -   `css-loader` -> _3.2.0_
        -   `file-loader` -> _4.2.0_
        -   `koa` -> _2.8.1_
        -   `koa-helmet` -> _5.1.0_
        -   `less` -> _3.10.3_
        -   `mini-css-extract-plugin` -> _0.8.0_
        -   `react` -> _16.9.0_
        -   `react-dom` -> _16.9.0_
        -   `sass-loader` -> _7.3.1_
        -   `webpack` -> _4.39.2_
        -   `webpack-bundle-analyzer` -> _3.4.1_
        -   `webpack-dev-server` -> _3.8.0_
    -   patch
        -   `@babel/core` -> _7.5.5_
        -   `@babel/plugin-proposal-class-properties` -> _7.5.5_
        -   `@babel/plugin-proposal-object-rest-spread` -> _7.5.5_
        -   `@babel/plugin-transform-runtime` -> _7.5.5_
        -   `@babel/preset-env` -> _7.5.5_
        -   `@types/react-redux` -> _7.1.2_
        -   `cache-loader` -> _4.1.0_
        -   `copy-webpack-plugin` -> _5.0.4_
        -   `execa` -> _2.0.4_
        -   `inquirer` -> _6.5.1_
        -   `js-cookie` -> _2.2.1_
        -   `koa-body` -> _4.1.1_
        -   `lodash` -> _4.17.15_
        -   `portfinder` -> _1.0.23_
        -   `react-hot-loader` -> _4.12.11_
        -   `thread-loader` -> _2.1.3_
        -   `url-loader` -> _2.1.0_

**koot-boilerplate**

-   更新依赖包
    -   minor
        -   `husky` -> _3.0.4_
        -   `lint-staged` -> _9.2.3_

**koot-cli**

-   更新依赖包
    -   minor
        -   `package-json` -> _6.5.0_
        -   `semver` -> _6.3.0_
    -   patch
        -   `inquirer` -> _6.5.1_

## 0.10.15

**2019-08-20**

核心

-   **错误修正**
    -   修正配置项 `renderCache = false` 时不生效的问题：现在可以正确的禁用服务器渲染缓存了

## 0.10.14

**2019-08-13**

核心

-   **优化**
    -   客户端更新页面信息的逻辑

## 0.10.13

**2019-08-09**

核心

-   **优化**
    -   同构/SSR: `__REDUX_STATE__` 与 `__KOOT_SSR_STATE__` 会经过转义输出，并在初始化时自动反转义，以增强安全性

## 0.10.12

**2019-08-01**

核心

-   **优化**
    -   更新 TS 定义

## 0.10.11

**2019-07-30**

核心

-   **优化**
    -   调整同构/SSR 服务器逻辑，现在在 `beforeDataToStore` 周期运行之前，会有一次 `renderToString` 操作，用以获取当前匹配的组件
        -   取消上一版本针对同构/SSR 项目的改动

## 0.10.10

**2019-07-30**

核心

-   **优化**
    -   优化开发环境的热更新体验
        -   同构/SSR 项目在开发环境中，每次访问页面后，服务器会自动重置
        -   开发环境中监控客户端资源的 _Webpack_ 服务器现在每次打包后不再会重置 `koot-css-loader` 的计数器

## 0.10.9

**2019-07-26**

核心

-   **错误修正**
    -   修正：某些情况下 SPA 打包结果会被自动清空的问题

## 0.10.8

**2019-07-22**

核心

-   **优化**
    -   同构/SSR 项目中的模板注入函数现在会传入第 3 个参数: `ctx` - KOA 的 `ctx` 对象

## 0.10.7

**2019-07-16**

核心

-   **优化**
    -   更新 TS 定义
-   更新依赖包
    -   minor
        -   `inquirer` -> _6.5.0_
        -   `yargs` -> _13.3.0_
    -   patch
        -   `@babel/core` -> _7.5.4_
        -   `@babel/plugin-proposal-object-rest-spread` -> _7.5.4_
        -   `@babel/preset-env` -> _7.5.4_
        -   `@types/node` -> _12.6.3_
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

## 0.10.6

**2019-07-16**

核心

-   **优化**
    -   更新 TS 定义

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
            -   类似 `.component .component` 这样使用空格 (``) 选择器或 `>`选择器时，现在选择器之后的`.component` 字段会被保留，不会进行 hash。使用其他选择器的情况依旧会进行 hash。详情请参见文档 [CSS/组件 CSS 的 className hash 规则](https://koot.js.org/#/css?id=组件-css-的-classname-hash-规则) ([#68](https://github.com/cmux/koot/issues/68))
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
