# 项目配置

项目根目录中的 `/koot.config.js` 为 koot 项目总配置文件，所有的 koot.js 项目必须提供该配置文件。

-   可通过 NPM 命令指定配置文件的路径，请参见 [命令](/task)。
-   该文件需要输出 _**Object**_。下面列出的配置项均为该对象的第一级属性。
-   如无特殊说明，所有配置项目均为**可选项**。

**特殊类型: Pathname**

`Pathname` 类型表示到对应文件的路径名，支持绝对路径和相对路径，相对路径必须以 `.` 开头。

`Pathname:[type]` 类型表示到对应文件的路径名，对应的文件必须是 `.js` `.jsx` `.mjs` `.cjs` `.ts` 或 `.tsx` 文件，同时输出对应类型的结果。如 `Pathname:Object` 表示对应到 js 文件，该文件需要输出 `Object` 类型。

**简单配置示例**

```javascript
// /koot.config.js
module.exports = {
    name: 'Test Subject D-HU',
    template: './src/template.ejs',
    routes: './src/routes',
    store: './src/store',
};
```

---

## 项目基本信息

### name

-   类型: `string`
-   默认值: `package.json` 中的 `name` 属性

项目名称。以下情况会使用该名称作为默认值：

-   同构：若首页组件没有通过 `extend()` 设定标题，默认使用该名作为页面标题。
-   SPA：模板中的 `<%= inject.title %>` 默认使用该名进行注入替换。

_TODO_: 支持定制不同语种的项目名

### type

-   类型: `string`
-   默认值: `react`

项目类型。

```javascript
module.exports = {
    // React 同构 (默认值)
    type: 'react',

    // React SPA
    type: 'react-spa',
};
```

### target

-   类型: `string`
-   默认值: _无_

项目子类型

```javascript
module.exports = {
    // 默认值：无指定
    target: '',

    // Serverless 模式 SSR
    target: 'serverless',

    // Electron 模式 SPA
    target: 'electron',
};
```

### dist

-   类型: `Pathname`
-   默认值: `./dist`
-   **仅针对**: 生产环境

打包结果存放路径。

### template

-   类型: `Pathname`
-   默认值: _无_
-   **必填**

HTML 模板文件路径。目前仅支持 `.ejs` 文件。有关模板的使用请查阅 [HTML 模板](/template)。

```javascript
module.exports = {
    // 示例配置
    template: './src/template.ejs',
};
```

### templateInject

-   类型: `Pathname:Object`
-   默认值: _无_

自定义 HTML 模板替换内容。请查阅 [HTML 模板](/template)。

```javascript
module.exports = {
    // 示例配置
    templateInject: './src/template-inject.js',
};
```

### i18n

-   类型: `boolean` `Object` 或 `Array[]`
-   默认值: `false`

多语言配置。

关于详细配置、多语言的使用、语言包规则等内容，请查阅 [多语言 (i18n)](/i18n)。

```javascript
module.exports = {
    // 不启用多语言支持 (默认值)
    i18n: false,

    /** 简易配置
     * - `Array` 中每一个元素为 `Array`，其内第一个元素为**语种ID**，第二个元素为**语言包文件路径**
     * - 采用该配置方式时，其他多语言相关选项均采用默认值（见下）
     * - 第一行为默认语种
     * - 语言包可以为 JSON 文件，也可以为以 `module.exports` 方式输出 JSON 的 JavaScript 文件
     */
    i18n: [
        ['zh', './src/locales/zh.json'],
        ['zh-tw', './src/locales/zh-tw.json'],
        // ['en', './src/locales/en.json'],
        ['en', './src/locales/en.js'],
    ],

    // 详细配置。配置项及其说明详见多语言章节 (链接见上文)
    i18n: {
        [option]: 'value',
    },
};
```

---

## 路由 & 客户端历史记录

### routes

-   类型: `Pathname:Object`
-   默认值: _无_
-   **必填**

路由配置，供 `react-router` 使用。Koot.js 目前使用的 `react-router` 版本为 _**v3**_。

有关路由配置的编写请查阅 [react-router v3 官方文档/Route Configuration](https://github.com/ReactTraining/react-router/blob/v3/docs/guides/RouteConfiguration.md)。

```javascript
module.exports = {
    // 示例配置
    routes: './src/routes',
};
```

### historyType

-   类型: `string`
-   默认值: 自动匹配 (同构项目使用 `browserHistory`，SPA 项目使用 `hashHistory`)
-   **仅针对**: 客户端

项目所用的 `history` 组件的类型。可省略 `History` 字段，如 `browserHistory` 和 `browser` 等效。

```javascript
module.exports = {
    // 示例配置：无论项目类型，客户端环境统一使用 hashHistory
    historyType: 'hash',
};
```

---

## 数据存储 & Store

### store

-   类型: `Pathname:Function`
-   默认值: _无_

生成 Redux store 的方法函数。推荐使用全局函数 `createStore()` 创建 _Redux store_。

```javascript
/****************************
 * 文件: /koot.config.js
 ***************************/
module.exports = {
    store: './src/store',
};

/****************************
 * 文件: /src/store/index.js
 ***************************/
const { createStore } = require('koot');

/**
 * @type {Reducer | ReducersMapObject}
 * 项目使用的 reducer，可以是形式为 Object 的列表，也可以是 reducer 函数
 */
const appReducers = require('./reducers.js');
/**
 * @type {Array<Middleware>}
 * 项目使用的 middleware 列表
 */
const appMiddlewares = require('./middlewares.js');

module.exports = () => createStore(appReducers, appMiddlewares);
```

有关 `createStore()` 全局函数的详细用法，请查阅 [Store/全局函数 createStore](/store?id=全局函数-createstore)。

### cookiesToStore

-   类型: `boolean` `string` 或 `string[]`
-   默认值: `true`
-   **仅针对**: SSR 项目

将 cookie 写入到 Redux store 中的 `state.server.cookie`。

```javascript
module.exports = {
    // 将所有 cookie 写入到到 store 中 (默认值)
    // `state.server.cookie` 为 cookie 原始字符串
    cookiesToStore: true,

    // 将所有 cookie 写入到到 store 中
    // `state.server.cookie` 为对象，key/value 对应 cookie 的每一项
    cookiesToStore: 'all',

    // 不启用该功能
    cookiesToStore: false,

    // 仅将名为 `userToken` 的 cookie 写入到 store 中
    // `state.server.cookie` 为对象，key/value 对应 cookie 的每一项
    cookiesToStore: ['userToken'],
};
```

### sessionStore

-   类型: `boolean` 或 `Object`
-   默认值: `false`
-   **仅针对**: 客户端环境

将全部或部分 _store_ 对象同步到浏览器/客户端的 `sessionStorage` 中，在用户刷新页面后，这些值会被还原到 _store_，以确保和刷新前一致。

```javascript
module.exports = {
    // 不启用 sessionStore 特性 (默认值)
    sessionStore: false,

    // 同步所有 _store_ 对象
    // 不包括服务器相关数据，如 `localeId`、`server` 等
    sessionStore: true,
    sessionStore: 'all',

    // 同步指定的对象内容
    // 仅有设为 `true` 的属性会被同步
    // 可通过对象的方式控制某个对象内哪些属性被同步
    sessionStore: {
        user: true,
        page: {
            home: true,
        },
    },
};
```

---

## 客户端设置 & 生命周期

### icon

-   类型: `Pathname` 或 `Object`
-   默认值: _无_

项目图标配置。

-   ⚠️ 如果提供了图标，但 `webApp` 选项关闭，不过产生任何结果
-   如果提供了图标，且 `webApp` 选项开启，生成、渲染的 HTML 代码中将会自动添加有关 `favicon` `manifest` 等信息的 `<meta>` 标签
-   如果提供了图标，且为 Electron 程序，在打包可执行文件时会自动设置文件图标

```javascript
module.exports = {
    /** 默认不提供 */
    icon: undefined,

    /** 提供图标文件路径，Koot.js 会尝试自动生成适用于不同场景的各种尺寸的版本 */
    icon: './src/assets/icon.png',
};
```

### webApp

-   类型: `boolean` 或 `Object`
-   默认值: 如果提供了 `icon` 为 `true`，否则为 `false`

WebApp / PWA 相关设置。在设定了 App 图标 (`icon` 设置项) 时，_Koot.js_ 会默认自动在生成、渲染的 HTML 代码结果中加入 WebApp 相关的 `<meta>` 和 `<link>` 标签。

关于详细配置和自动生成的 `<meta>` 和 `<link>` 标签的详情，请查阅 [WebApp & Service Worker](/pwa)。

```javascript
module.exports = {
    /** 未提供 icon 选项时默认关闭 */
    icon: undefined,
    webApp: false,

    /** 提供了 icon，默认开启 */
    icon: './src/assets/icon.png',
    webApp: true,

    /**
     * 详细配置。配置项及其说明详见 WebApp & Service Worker 章节 (链接见上文)
     */
    webApp: {
        [option]: 'value',
    },
};
```

### serviceWorker

-   类型: `boolean` 或 `Object`
-   默认值: `true`

自动生成 `service-worker` 脚本文件的设置。

关于详细配置和自动生成的 `service-worker` 脚本文件的详情，请查阅 [WebApp & Service Worker](/pwa)。

```javascript
module.exports = {
    /**
     * **默认配置**
     * - 自动生成 Service-Worker 文件
     * - 预先缓存所有 Webpack 入口
     * - 客户端自动安装
     */
    serviceWorker: true,

    // 禁用自动生成 Service-Worker 文件，禁用自动安装
    serviceWorker: false,

    // 详细配置。配置项及其说明详见 WebApp & Service Worker (链接见上文)
    serviceWorker: {
        [option]: 'value',
    },
};
```

### electron

-   类型: `Object`
-   默认值: _空对象_

Electron 程序以及打包可执行文件的相关配置，具体配置内容和方式请查阅 [Electron/相关配置项](/electron?id=相关配置项)。

```javascript
module.exports = {
    // 详细配置。配置项及其说明详见 Electron 章节 (链接见上文)
    electron: {
        [option]: 'value',
    },
};
```

### before

-   类型: `Pathname:Function`
-   默认值: _无_
-   **仅针对**: 客户端

客户端/浏览器端中，在 React 代码执行/初始化之前，执行的方法。

```javascript
/****************************
 * 文件: /koot.config.js
 ***************************/
module.exports = {
    before: './src/lifecycle/client-before',
};

/****************************
 * 文件: /src/lifecycle/client-before.js
 ***************************/
/**
 * @param {Object} options
 * @param {Object} [options.ctx] 本次请求的 Koa ctx 对象
 * @param {Object} [options.history] History 对象
 * @param {string} [options.localeId] 本次请求的语种 ID
 * @returns {undefined|Promise<any>}
 */
export default ({ store, history, localeId }) => {
    // ...
};
```

### after

-   类型: `Pathname:Function`
-   默认值: _无_
-   **仅针对**: 客户端

客户端/浏览器端中，在 React 代码执行/初始化之后，执行的方法。

```javascript
/****************************
 * 文件: /koot.config.js
 ***************************/
module.exports = {
    after: './src/lifecycle/client-after',
};

/****************************
 * 文件: /src/lifecycle/client-after.js
 ***************************/
/**
 * @param {Object} options
 * @param {Object} [options.ctx] 本次请求的 Koa ctx 对象
 * @param {Object} [options.history] History 对象
 * @param {string} [options.localeId] 本次请求的语种 ID
 * @returns {undefined|Promise<any>}
 */
export default ({ store, history, localeId }) => {
    // ...
};
```

### onHistoryUpdate

-   类型: `Pathname:Function`
-   默认值: _无_
-   **仅针对**: 客户端

客户端/浏览器端中，在 URL 或历史记录 (由 `history` 管理) 更新时，执行的回调方法。

-   该回调发生在 `onRouterUpdate` 之前
-   如果路由对应组件进行了代码分割，则会按顺序进行以下行为
    1. **客户端/浏览器 URL 或历史记录改变之后即刻触发 `onHistoryUpdate`**
    2. 载入对应组件的代码 (如果已载入则跳过该步骤)
    3. 渲染相应组件
    4. 触发 `onRouterUpdate`

```javascript
/****************************
 * 文件: /koot.config.js
 ***************************/
module.exports = {
    onHistoryUpdate: './src/lifecycle/client-history-update',
};

/****************************
 * 文件: /src/lifecycle/client-history-update.js
 ***************************/
/**
 * @param {Object} location react-router 封装的 location 对象
 * @param {Object} store redux store 对象
 * @void
 */
export default (location, store) => {
    // ...
};
```

### onRouterUpdate

-   类型: `Pathname:Function`
-   默认值: _无_
-   **仅针对**: 客户端

客户端/浏览器端中，在路由 (由 `react-router` 管理) 更新时，执行的回调方法。

-   该回调发生在 `onHistoryUpdate` 之后
-   如果路由对应组件进行了代码分割，则会按顺序进行以下行为
    1. 客户端/浏览器 URL 或历史记录改变之后即刻触发 `onHistoryUpdate`
    2. 载入对应组件的代码 (如果已载入则跳过该步骤)
    3. 渲染相应组件
    4. **触发 `onRouterUpdate`**

```javascript
/****************************
 * 文件: /koot.config.js
 ***************************/
module.exports = {
    onRouterUpdate: './src/lifecycle/client-router-update',
};

/****************************
 * 文件: /src/lifecycle/client-router-update.js
 ***************************/
export default (...args) => {
    // 传入的参数与 `react-router` 相应的回调方法相同
};
```

---

## 服务器端设置 & 生命周期

### port

-   类型: `Number`
-   默认值: `8080`
-   **仅针对**: 服务器端

服务器启动端口号。（开发环境默认会使用该端口号）

### renderCache

-   类型: `Object` 或 `boolean`
-   默认值: `false`
-   **仅针对**: 服务器端，生产环境

生产环境下服务器渲染缓存相关设置。

```javascript
module.exports = {
    // 默认值：完全禁用
    renderCache: false,

    // 开启
    renderCache: true,

    /**
     * 详细设置
     * @typedef renderCache
     * @type {Object}
     * @property {number} [maxAge=5000]
     *           每条结果最多保存时间, 单位: 毫秒 (ms)
     * @property {number} [maxCount=50]
     *           根据 URL 保留的结果条目数
     * @property {(url)=>string|boolean} [get]
     *           自定义缓存检查与吐出方法。存在时, maxAge 和 maxCount 设置将被忽略
     *           参数 url - 请求的完整的 URL
     *           返回 false 时，表示该 URL 没有缓存结果
     * @property {(url,html)=>void} [set]
     *           自定义缓存存储方法。存在时, maxAge 和 maxCount 设置将被忽略
     *           参数 url - 请求的完整的 URL
     *           参数 html - 服务器渲染结果
     */
    renderCache: {
        maxAge: 5000,
        maxCount: 50,
        get: (url) => {
            // 自实现的缓存结果获取逻辑
            // return false
            return '完整渲染结果';
        },
        set: (url, html) => {
            // 自实现的缓存结果存储逻辑
        },
    },
};
```

### proxyRequestOrigin

-   类型: `Object`
-   默认值: `{}` (空对象)
-   **仅针对**: SSR 项目的服务器端、生产环境

如果当前项目的 Node.js 服务器是通过其他代理服务器请求的（如 nginx 反向代理），可用这个配置声明原始请求的信息。

```javascript
module.exports = {
    // 默认值
    proxyRequestOrigin: {},

    /**
     * 详细设置
     * @typedef proxyRequestOrigin
     * @type {Object}
     * @property {string} [protocol]
     *           协议名
     */
    proxyRequestOrigin: {
        protocol: 'https',
    },
};
```

### koaStatic

-   类型: `Object`
-   默认值: _见下_
-   **仅针对**: 服务器端

`koa-static` 静态资源服务器配置。配置对象采用 `koa-static` 的官方方案。

```javascript
module.exports = {
    // 默认值
    koaStatic: {
        maxage: 0,
        hidden: false,
        index: 'index.html',
        defer: false,
        gzip: true,
        extensions: false,
    },
};
```

### serverBefore

-   类型: `Function`
-   默认值: _无_
-   **仅针对**: SSR 项目的服务器端

在服务器端创建 _Koa_ 实例后、挂载任何中间件之前，执行的方法。

```javascript
module.exports = {
    // 默认值
    serverBefore: undefined,

    /**
     * @async
     * @param {Object} app Koa实例
     * @void
     */
    serverBefore: async (app) => {
        // 案例：挂载静态目录中间件
    },
};
```

### serverAfter

-   类型: `Function`
-   默认值: _无_
-   **仅针对**: SSR 项目的服务器端

在服务器端 _Koa_ 挂载所有中间件后、正式启动服务器服务之前，执行的方法。

```javascript
module.exports = {
    // 默认值
    serverAfter: undefined,

    /**
     * @async
     * @param {Object} app Koa实例
     * @void
     */
    serverAfter: async (app) => {
        // ...
    },
};
```

### serverOnRender

-   类型: `Function` 或 `Object`
-   默认值: _无_
-   **仅针对**: SSR 项目的服务器端

在服务器端计算 React 渲染结果时运行的方法。有关 SSR 时的流程和生命周期顺序，请参见 [生命周期/服务器端渲染流程](/life-cycle?id=服务器端渲染流程)

```javascript
module.exports = {
    // 默认值
    serverOnRender: undefined,

    /** 在路由 (`react-router`) 匹配之后、进行 store 相关数据计算之前，运行的方法
     * @async
     * @param {Object} options
     * @param {Object} [options.ctx] 本次请求的 Koa ctx 对象
     * @param {Object} [options.store] redux store 对象
     * @param {string} [options.localeId] 本次请求的语种 ID
     * @void
     */
    serverOnRender: async ({ ctx, store, localeId }) => {
        // 案例: 检查用户是否登录，如没有登陆，通过 Koa ctx 进行跳转
    },

    // 详细设置
    serverOnRender: {
        /** `serverOnRender.beforeRouterMatch`
         * - 类型: `Function`
         *
         * 在路由 (`react-router`) 匹配之前，运行的方法
         *
         * @async
         * @param {Object} options
         * @param {Object} [options.ctx] 本次请求的 Koa ctx 对象
         * @param {Object} [options.store] redux store 对象
         * @void
         */
        beforeRouterMatch: async ({ ctx, store }) => {
            // ...
        },

        /** `serverOnRender.beforePreRender`
         * - 类型: `Function`
         *
         * 在路由 (`react-router`) 匹配之后、进行预渲染之前，运行的方法
         *
         * @async
         * @param {Object} options
         * @param {Object} [options.ctx] 本次请求的 Koa ctx 对象
         * @param {Object} [options.store] redux store 对象
         * @param {string} [options.localeId] 本次请求的语种 ID
         * @void
         */
        beforePreRender: async ({ ctx, store, localeId }) => {
            // ...
        },

        /** `serverOnRender.beforeDataToStore`
         * - 类型: `Function`
         *
         * 在预渲染之后、进行 store 相关数据计算之前，运行的方法
         * - 同 `serverOnRender` 为 `Function` 的情况
         *
         * @async
         * @param {Object} options
         * @param {Object} [options.ctx] 本次请求的 Koa ctx 对象
         * @param {Object} [options.store] redux store 对象
         * @param {string} [options.localeId] 本次请求的语种 ID
         * @void
         */
        beforeDataToStore: async ({ ctx, store, localeId }) => {
            // ...
        },

        /** `serverOnRender.afterDataToStore`
         * - 类型: `Function`
         *
         * 在进行 store 相关数据计算之后，运行的方法
         *
         * @async
         * @param {Object} options
         * @param {Object} [options.ctx] 本次请求的 Koa ctx 对象
         * @param {Object} [options.store] redux store 对象
         * @param {string} [options.localeId] 本次请求的语种 ID
         * @void
         */
        afterDataToStore: async ({ ctx, store, localeId }) => {
            // ...
        },
    },
};
```

---

## 打包 & Webpack

### webpackConfig

-   类型: `Object` 或 `Function`
-   默认值: _无_
-   **必填**
-   **仅针对**: Webpack 打包过程

Webpack 打包配置。如果为 `Function`，需要返回 Webpack 打包配置，可为异步方法。

相关的注意事项请查阅 [Webpack 相关](/webpack)。

```javascript
module.exports = {
    // 默认值
    webpackConfig: undefined,

    // 示例配置 (koot-boilerplate 使用的配置)
    webpackConfig: async () => ({
        entry: {
            /**
             * 自定入口文件，需要手动编写使用逻辑
             * - 该模板项目中，本 `critical` 入口的结果会被自动写入到 HTML 结果内，位于 `<body>` 标签中所有自动插入的 `<script>` 标签之前
             * - 详见模板文件 `/src/index.ejs` 内的 `<%- content('critical.js') %>`
             */
            critical: [path.resolve(__dirname, '../src/critical.js')],

            /**
             * Koot.js 会自动加入一个名为 `client` 的入口，其中包含所有 React 相关逻辑
             * - 模板中的 `<%- inject.scripts %>` 会被自动替换为 `client` 入口的相关内容
             */
        },
        module: {
            rules: [
                /**
                 * Koot.js 会为以下类型的文件自动添加 loader，无需进行配置
                 * - `js` `mjs` `jsx`
                 * - `css` `sass` `less`
                 */
                {
                    test: /\.(ico|gif|jpg|jpeg|png|webp)$/,
                    loader:
                        'file-loader?context=static&name=assets/[hash:32].[ext]',
                    exclude: /node_modules/,
                },
                {
                    test: /\.svg$/,
                    loader: 'svg-url-loader',
                    exclude: /node_modules/,
                    options: {
                        noquotes: true,
                    },
                },
            ],
        },
    }),
};
```

### distClientAssetsDirName

-   类型: `string`
-   默认值: `includes`
-   **仅针对**: Webpack 打包过程

客户端打包结果中静态资源存放路径的目录名。

```javascript
module.exports = {
    // 默认值
    distClientAssetsDirName: 'includes',

    // 所有客户端静态资源文件均会存储到 [dist目录]/public/koot-*/assets/ 目录下
    distClientAssetsDirName: 'assets',
};
```

### moduleCssFilenameTest

-   类型: `RegExp` 或 `Object` 或 `Array<RegExp>` 或 `Array<Object>`
    -   `Object` 为 _Webpack_ `module.rule`
-   默认值: `/\.(component|view|module)/`
-   **仅针对**: Webpack 打包过程

组件 CSS 文件名检查规则，不包括扩展名部分。有关 CSS 的使用请查阅 [CSS](/css)。

_默认值解释:_ 文件名以 `.component.css` `.view.css` 或 `.module.css` (扩展名可为 `css` `less` `sass`) 为结尾的文件会当作组件 CSS，其他文件会被当做全局 CSS。

⚠️ _TypeScript_ 项目中，如果修改了该配置，针对组件 CSS 对象的默认的 TS 定义声明会失效。

```javascript
module.exports = {
    // 默认值
    moduleCssFilenameTest: /\.(component|view|module)/,
};
```

### internalLoaderOptions

-   类型: `Object`
-   默认值: _无_
-   **仅针对**: _Webpack_ 打包过程

用以扩展几乎无法修改的内置 Webpack loader 的配置。

```javascript
module.exports = {
    // 默认值
    internalLoaderOptions: undefined,

    // 示例: 扩展 `less-loader` 的配置
    internalLoaderOptions: {
        'less-loader': {
            modifyVars: {
                'base-font-size': '40px',
            },
        },
    },
};
```

### classNameHashLength

-   `koot >= 0.9`
-   类型: `number`
-   默认值: `6`
-   **仅针对**: _Webpack_ 打包过程

调整组件 CSS 的 className hash 长度。

```javascript
module.exports = {
    // 默认值
    classNameHashLength: 6,

    // 示例: 生产环境与开发环境使用不同的值
    classNameHashLength: process.env.WEBPACK_BUILD_ENV === 'dev' ? 16 : 4,
};
```

### bundleVersionsKeep

-   `koot >= 0.9`
-   类型: `number` `boolean`
-   默认值: `2`
-   **仅针对**: 生产环境，_Webpack_ 打包过程

保留最近 `N` 次的客户端打包结果文件。如果为自然数，表示开启该功能，其他值均表示关闭该功能。

```javascript
module.exports = {
    // 默认值
    bundleVersionsKeep: 2,

    // 关闭该功能
    // ⚠️ 如果使用 koot-cli 从 0.9 之前的版本升级，默认会关闭该功能
    bundleVersionsKeep: false,
};
```

### exportGzip

-   `koot >= 0.13`
-   类型: `boolean`
-   默认值: `true`
-   **仅针对**: 生产环境，客户端，_Webpack_ 打包过程

是否自动输出 _Gzip_ 压缩后的 `*.gz` 文件。

```javascript
module.exports = {
    // 默认值: 客户端打包结果中，每一个文件都有同名但以 `.gz` 为结尾的 _Gzip_ 压缩后的文件
    exportGzip: true,

    // 关闭该功能
    exportGzip: false,
};
```

### staticCopyFrom

-   类型: `Pathname` 或 `Pathname[]`
-   默认值: **无**

将目标目录内的所有文件复制到打包结果内的静态服务器目录中。

-   原封不动的复制，会保留文件名和目录结构
-   开发环境下也可以使用

```javascript
const path = require('path');
module.exports = {
    // 默认值
    staticCopyFrom: undefined,

    // 示例 #1 - 复制一个目录
    staticCopyFrom: path.resolve(__dirname, './src/assets/public'),

    // 示例 #2 - 复制多个目录
    staticCopyFrom: [
        path.resolve(__dirname, './src/assets/public'),
        path.resolve(__dirname, './.data-generated/public'),
    ],
};
```

示例效果:

-   文件 `/web/src/assets/public/favicon.ico` 可使用以下 URL 访问: `/favicon.ico`

### serverPackAll

-   类型: `boolean`
-   默认值: _Serverless_ 模式为 `true`，其余情况为 `false`
-   **仅针对**: 生产环境，服务器端

设定是否打入所有 _Module_。

⚠️ 开启该选项后，服务器进程将会占用更多的内存空间

### webpackBefore

-   类型: `Function`
-   默认值: _无_
-   **仅针对**: Webpack 打包过程

Webpack 打包执行之前执行的方法。

```javascript
module.exports = {
    // 默认值
    webpackBefore: undefined,

    /**
     * @async
     * @param {Object} kootConfigWithExtra koot 完整配置对象，附加额外信息
     * @void
     */
    webpackBefore: async (kootConfigWithExtra) => ({
        /*
         * `kootConfigWithExtra` 对象中的额外信息
         * - `__WEBPACK_OUTPUT_PATH` - 本次打包的目标目录
         * - `__CLIENT_ROOT_PATH` - 仅针对客户端，本次打包结果的客户端根目录
         */
    }),
};
```

### webpackAfter

-   类型: `Function`
-   默认值: _无_
-   **仅针对**: Webpack 打包过程

Webpack 打包执行之后执行的方法。

```javascript
module.exports = {
    // 默认值
    webpackAfter: undefined,

    /**
     * @async
     * @param {Object} kootConfigWithExtra koot 完整配置对象，附加额外信息
     * @void
     */
    webpackAfter: async (kootConfigWithExtra) => ({
        // `kootConfigWithExtra` 中的额外信息详见上文 `webpackBefore` 的说明
    }),
};
```

---

## 开发环境 & 开发设置

### aliases

-   类型: `Object`
-   默认值: `{}` (空对象)

定义文件、路径别名。可在任何项目代码中使用。该功能使用 `webpack.resolve.alias` 实现。

> 项目代码指所有经过 _Webpack_ 处理的 _JavaScript_ 文件的代码。通常来说，除了 _Koot.js_ 项目配置文件 (`koot.config.js`)、_Babel_ 配置文件 (`babel.config.js`) 等配置文件外，其他所有的代码文件都会经过 _Webpack_ 处理。

```javascript
const path = require('path');
module.exports = {
    // 默认值
    aliases: {},

    // 示例
    aliases: {
        '@src': path.resolve('./src'),
        '@assets': path.resolve('./src/assets'),
        '~base.less': path.resolve('./src/assets/css/base.less'),
    },
};
```

```javascript
// 针对上述示例的代码
import App from '@src/components/app';
```

```less
// 针对上述示例的代码
import '~base.less';
```

### defines

-   类型: `Object`
-   默认值: `{}` (空对象)

定义 JavaScript 代码中的常量。可在任何 JavaScript 项目代码中使用。使用 Webpack 插件 `DefinePlugin` 实现。

> 项目代码指所有经过 _Webpack_ 处理的 _JavaScript_ 文件的代码。通常来说，除了 _Koot.js_ 项目配置文件 (`koot.config.js`)、_Babel_ 配置文件 (`babel.config.js`) 等配置文件外，其他所有的代码文件都会经过 _Webpack_ 处理。

```javascript
module.exports = {
    // 默认值
    defines: {},

    // 示例
    defines: {
        __QA__: JSON.stringify(false),
    },
};
```

```javascript
// 针对上述示例的代码
const apiBase = __QA__
    ? `http://qa-api.project.com/`
    : `https://api.project.com/`;
```

### devPort

-   类型: `Number`
-   默认值: _无_ (默认使用配置项 `port` 的值)
-   **仅针对**: 开发环境

指定开发环境端口号。

```javascript
module.exports = {
    // 默认值 (默认使用配置项 `port` 的值)
    devPort: undefined,

    // 示例: 指定开发环境采用 8088 端口
    devPort: 8088,
};
```

### devDll

-   类型: `Array`
-   默认值: _见下_
-   **仅针对**: 开发环境

开发环境中，将部分 NPM 包独立打包，在之后更新的过程中，这些 NPM 包不会参与热更新流程，从而加速热更新速度。

```javascript
module.exports = {
    // 默认值
    devDll: [
        'react',
        'react-dom',
        'redux',
        'redux-thunk',
        'react-redux',
        'react-router',
        'react-router-redux',
        // 以及其他常见的第三方库/包
    ],
};
```

### devHmr

-   类型: `Object`
-   默认值: _见下_
-   **仅针对**: 开发环境

扩展 Webpack 插件 `HotModuleReplacementPlugin` 的配置。

```javascript
module.exports = {
    // 默认值
    devHmr: {
        multiStep: false,
    },

    // 开发环境下启动多步打包，以进一步加速热更新速度
    devHmr: {
        multiStep: true,
        fullBuildTimeout:
            process.env.WEBPACK_BUILD_TYPE === 'spa' ? 500 : undefined,
        requestTimeout:
            process.env.WEBPACK_BUILD_TYPE === 'spa' ? undefined : 1000,
    },
};
```

### devServer

-   类型: `Object`
-   默认值: _见下_
-   **仅针对**: 开发环境

扩展 `webpack-dev-server` 配置对象。

```javascript
module.exports = {
    // 默认值
    devServer: {
        quiet: false,
        stats: { colors: true },
        clientLogLevel: 'error',
        hot: true,
        inline: true,
        historyApiFallback: true,
        contentBase: './',
        publicPath: TYPE === 'spa' ? '/' : '/dist/',
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        open: TYPE === 'spa',
        watchOptions: {
            ignored: [getDistPath(), path.resolve(getDistPath(), '**/*')],
        },
        before: (app) => {
            if (appType === 'ReactSPA') {
                require('../../ReactSPA/dev-server/extend')(app);
            }
            if (typeof before === 'function') return before(app);
        },
    },
};
```

### devServiceWorker

-   类型: `boolean` 或 `Object`
-   默认值: `false`
-   **仅针对**: 开发环境

设定开发环境中是否应用 _Service Worker_。有关独立配置对象请查阅 [WebApp & Service Worker](/pwa)。

```javascript
module.exports = {
    // 默认值 - 开发环境中禁用 Service Worker
    devServiceWorker: false,

    // 开发环境中启用 Service Worker，采用 `serviceWorker` 配置对象
    devServiceWorker: true,

    // 开发环境中启用 Service Worker，采用独立配置对象
    // 配置项及其说明详见 WebApp & Service Worker 章节 (链接见上文)
    devServiceWorker: {
        [option]: `value`,
    },
};
```

### devMemoryAllocation

-   `koot >= 0.9`
-   类型: `Number` 或 `Object`
-   默认值: _无_
-   **仅针对**: 开发环境

指定开发环境中 node.js 分配的内存 (单位: MB)。

```javascript
module.exports = {
    // 默认值 (使用 node.js 默认)
    devMemoryAllocation: undefined,

    // SPA: 指定 `webpack-dev-server` (client) 分配的内存容量
    // SSR: 指定 `webpack-dev-server` (client) 和服务器打包进程 (server) 分配的内存容量
    devMemoryAllocation: 2048,

    // SSR: 分别指定 `webpack-dev-server` (client) 和服务器打包进程 (server) 分配的内存容量
    devMemoryAllocation: {
        client: 2048,
        server: 1024,
    },

    // SSR: 仅指定 `webpack-dev-server` (client) 分配的内存容量
    devMemoryAllocation: {
        client: 2048,
    },

    // SSR: 仅指定服务器打包进程 (server) 分配的内存容量
    devMemoryAllocation: {
        server: 1024,
    },
};
```
