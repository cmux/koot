# 项目配置

项目根目录中的 `/koot.config.js` 为 koot 项目总配置文件，所有的 koot.js 项目必须提供该配置文件。

该文件需要输出 _**Object**_。下面列出的配置项均为该对象的第一级属性。

如无特殊说明，所有配置项目均为**可选项**。

**特殊类型**

`Pathname` 类型表示到对应文件的路径名，支持绝对路径和相对路径，相对路径必须以 `.` 开头。

`Pathname:[type]` 类型表示到对应文件的路径名，对应的文件必须是 `.js` `.jsx` 或 `.mjs` 文件，同时输出对应类型的结果。如 `Pathname:Object` 表示对应到 js 文件，该文件需要输出 `Object` 类型。

**简单配置示例**

```javascript
// /koot.config.js
module.exports = {
    name: "Test Subject D-HU",
    template: "./src/template.ejs",
    routes: "./src/routes",
    store: "./src/store"
};
```

---

## 项目信息

### name

- 类型: `String`
- 默认值: `package.json` 中的 `name` 属性

项目名称。以下情况会使用该名称作为默认值：

- 同构：若首页组件没有通过 `extend()` 设定标题，默认使用该名作为页面标题。
- SPA：模板中的 `<%= inject.title %>` 默认使用该名进行注入替换。

### type

- 类型: `String`
- 默认值: `react`

项目类型。

```javascript
module.exports = {
    // React 同构 (默认值)
    type: 'react',

    // React SPA
    type: 'react-spa'
}
```

### dist

- 类型: `Pathname`
- 默认值: `./dist`

打包结果存放路径。

### template

- 类型: `Pathname`
- 默认值: _无_
- **必填**

HTML 模板文件路径。目前仅支持 `.ejs` 文件。有关模板的使用请查阅 [HTML 模板](/template)。

```javascript
module.exports = {
    // 示例配置
    template: "./src/template.ejs"
}
```

### templateInject

- 类型: `Pathname:Object`
- 默认值: _无_

自定义 HTML 模板替换内容。请查阅 [HTML 模板](/template)。

```javascript
module.exports = {
    // 示例配置
    templateInject: "./src/template-inject.js"
}
```

### routes

- 类型: `Pathname:Object`
- 默认值: _无_
- **必填**

路由配置，供 `react-router` 使用。Koot.js 目前使用的 `react-router` 版本为 _**v3**_。

有关路由配置的编写请查阅 [react-router v3 官方文档/Route Configuration](https://github.com/ReactTraining/react-router/blob/v3/docs/guides/RouteConfiguration.md)。

```javascript
module.exports = {
    // 示例配置
    templateInject: "./src/routes"
}
```

### historyType

- 类型: `String`
- 默认值: 自动匹配 (同构项目使用 `browserHistory`，SPA项目使用 `hashHistory`)
- **仅针对**: 客户端

项目所用的 `history` 组件的类型。可省略 `History` 字段，如 `browserHistory` 和 `browser` 等效。

```javascript
module.exports = {
    // 示例配置：无论项目类型，客户端环境统一使用 hashHistory
    historyType: "hash"
}
```

### store

- 类型: `Pathname:Function`
- 默认值: _无_

生成 Redux store 的方法函数。

```javascript
/****************************
 * 文件: /koot.config.js
 ***************************/
module.exports = {
    store: './src/store'
}

/****************************
 * 文件: /src/store/index.js
 ***************************/
const { createStore, combineReducers, applyMiddleware } = require('redux')
// Koot.js 提供的生成 Redux store 所需要的相关内容
const {
    reducers: kootDefaultReducers, initialState, middlewares
} = require('koot').reduxForCreateStore
// 项目使用的 reducer
const projectReducers = require('./reducers.js')

module.exports = () => createStore(
    combineReducers({
        ...kootDefaultReducers,
        ...projectReducers
    }),
    initialState,
    applyMiddleware(...middlewares)
)
```

### cookiesToStore

- 类型: `Boolean` `String` 或 `String[]`
- 默认值: `true`
- **仅针对**: 同构项目类型

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
}
```

### i18n

- 类型: `Boolean` `Object` 或 `Array[]`
- 默认值: `false`

多语言配置。

关于多语言的使用、语言包规则等，请查阅 [多语言 (i18n)](/i18n)。

```javascript
module.exports = {
    // 不启用多语言支持 (默认值)
    i18n: false,

    /** 简易配置
     * - `Array` 中每一个元素为 `Array`，其内第一个元素为**语种ID**，第二个元素为**语言包文件路径**
     * - 采用该配置方式时，其他多语言相关选项均采用默认值（见下）
     * - 第一行为默认语种
     */
    i18n: [
        ['zh', './src/locales/zh.json'],
        ['zh-tw', './src/locales/zh-tw.json'],
        ['en', './src/locales/en.json']
    ],

    /** 完整配置
     * - 当前列出的均为默认值
     * - 除 `locales` 外均为**可选项**
     */
    i18n: {
        /** `i18n.type`
         * - 类型: `String`
         * - 默认值: `default`
         * 
         * 多语言打包模式
         * **仅针对**: 生产环境
         * 
         * 目前支持:
         * - `default` (默认值)
         *   客户端按语种分别打包，语言包内容会直接打入到代码中，代码结果中不存在“语言包对象” 
         *   适合所有项目使用，推荐语言包较大的项目使用
         * - `redux`
         *   服务器输出 HTML 时，当前语种的语言包对象会写入 Redux store 
         *   适合语言包较小，或对文件/请求体积不敏感的 WebApp 项目使用 
         *   开发环境下会强制使用这一模式
         */
        type: 'default',

        /** `i18n.use`
         * - 类型: `String`
         * - 默认值: `query`
         *
         * 使用 URL 切换语种的方式
         *
         * 目前支持:
         * - `query` (默认值)
         *   一般情况下，URL 中不会存在有关语种的字段。
         *   切换语种时使用名为 hl 的 URL 参数，如：
         *     `https://some.project.com/?hl=zh-cn`
         *     `https://some.project.com/list/articles/?page=10&hl=ja-jp`
         * `router`
         *   规定路由的第一层为语种ID。
         *   如果访问的 URL 的路由第一层不是项目设定的已知的语种 ID，则会自动跳转到最近一次访问的语种或默认语种对应的页面。
         *     `https://some.project.com/` 自动跳转到 `https://some.project.com/zh-cn/`
         *   URL 示例：
         *     `https://some.project.com/zh-cn/`
         *     `https://some.project.com/ja-jp/list/articles/?page=10`
         */
        use: 'query',

        /** `i18n.expr`
         * - 类型: `String`
         * - 默认值: `__`
         *
         * JavaScript 代码中多语言翻译方法名
         */
        expr: '__',

        /** `i18n.domain`
         * - 类型: `String`
         * - 默认值: _无_
         *
         * Cookie 影响的域
         */
        domain: undefined,

        /** `i18n.cookieKey`
         * - 类型: `String`
         * - 默认值: `spLocaleId`
         *
         * 语种ID存储于 Cookie 中的字段名
         */
        cookieKey: 'spLocaleId',

        /** `i18n.locales`
         * - 类型: `Array[]`
         * - 默认值: `[]`
         *
         * 语种ID和语言包。参见上文简易配置
         */
        locales: []
    },
}
```

### pwa

- 类型: `Boolean` 或 `Object`
- 默认值: `true`

自动生成 `service-worker` 脚本文件的设置。

关于自动生成的 `service-worker` 脚本文件的详情，请查阅 [PWA](/pwa)。

```javascript
module.exports = {
    // 自动生成 `service-worker` 脚本文件，并自动注册 (默认值)
    pwa: true,

    // 不启用默认的 PWA 相关机制和功能
    pwa: false,

    // 详细设置
    // TODO: 详细配置规则仍在调整中，暂不提供文档
    pwa: {}
}
```

### aliases

- 类型: `Object`
- 默认值: `{}` (空对象)

定义文件、路径别名。可在任何经过 Webpack 处理的 JavaScript 和 CSS 相关文件中使用。

- 一般情况下，所有 React 相关代码均会经过 Webpack 处理
- 使用 `webpack.resolve.alias` 实现

```javascript
const path = require('path')
module.exports = {
    // 默认值
    aliases: {},

    // 示例
    aliases: {
        '@src': path.resolve('./src'),
        '@assets': path.resolve('./src/assets'),
        '~base.less': path.resolve('./src/assets/css/base.less'),
    },
}
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

- 类型: `Object`
- 默认值: `{}` (空对象)

定义 JavaScript 代码中的常量。可在任何经过 Webpack 处理的 JavaScript 相关文件中使用。

- 一般情况下，所有 React 相关代码均会经过 Webpack 处理
- 使用 Webpack 插件 `DefinePlugin` 实现

```javascript
module.exports = {
    // 默认值
    defines: {},

    // 示例
    defines: {
        __QA__: JSON.stringify(false),
    },
}
```

```javascript
// 针对上述示例的代码
const apiBase = __QA__ ? `http://qa-api.project.com/` : `https://api.project.com/`;
```

### staticCopyFrom

- 类型: `Pathname`
- 默认值: __无__

将目标目录内的所有文件复制到打包结果内的静态服务器目录中。

- 原封不动的复制，会保留文件名和目录结构
- 开发环境下也可以使用

```javascript
const path = require('path')
module.exports = {
    // 默认值
    staticCopyFrom: undefined,

    // 示例
    staticCopyFrom: path.resolve(__dirname, './src/assets/public'),
}
```

示例效果:

- 文件 `/web/src/assets/public/favicon.ico` 可使用以下 URL 访问: `/favicon.ico`

---

## 客户端生命周期

### before

- 类型: `Pathname:Function`
- 默认值: _无_
- **仅针对**: 客户端

客户端/浏览器端中，在 React 代码执行/初始化之前，执行的方法。

```javascript
/****************************
 * 文件: /koot.config.js
 ***************************/
module.exports = {
    before: './src/lifecycle/client-before'
}

/****************************
 * 文件: /src/lifecycle/client-before.js
 ***************************/
export default ({ store, history, localeId }) => {
    // ...
}
```

### after

- 类型: `Pathname:Function`
- 默认值: _无_
- **仅针对**: 客户端

客户端/浏览器端中，在 React 代码执行/初始化之后，执行的方法。

```javascript
/****************************
 * 文件: /koot.config.js
 ***************************/
module.exports = {
    after: './src/lifecycle/client-after'
}

/****************************
 * 文件: /src/lifecycle/client-after.js
 ***************************/
export default ({ store, history, localeId }) => {
    // ...
}
```

### onHistoryUpdate

- 类型: `Pathname:Function`
- 默认值: _无_
- **仅针对**: 客户端

客户端/浏览器端中，在 URL 或历史记录 (由 `history` 管理) 更新时，执行的回调方法。

- 该回调发生在 `onRouterUpdate` 之前
- 如果路由对应组件进行了代码分割，则会按顺序进行以下行为
  1. 客户端/浏览器 URL 或历史记录改变之后即刻触发 `onHistoryUpdate`
  2. 载入对应组件的代码 (如果已载入则跳过该步骤)
  3. 渲染相应组件
  4. 触发 `onRouterUpdate`

```javascript
/****************************
 * 文件: /koot.config.js
 ***************************/
module.exports = {
    onHistoryUpdate: './src/lifecycle/client-history-update'
}

/****************************
 * 文件: /src/lifecycle/client-history-update.js
 ***************************/
export default (location, Store) => {
    // ...
}
```

### onRouterUpdate

- 类型: `Pathname:Function`
- 默认值: _无_
- **仅针对**: 客户端

客户端/浏览器端中，在路由 (由 `react-router` 管理) 更新时，执行的回调方法。

- 该回调发生在 `onHistoryUpdate` 之后
- 如果路由对应组件进行了代码分割，则会按顺序进行以下行为
  1. 客户端/浏览器 URL 或历史记录改变之后即刻触发 `onHistoryUpdate`
  2. 载入对应组件的代码 (如果已载入则跳过该步骤)
  3. 渲染相应组件
  4. 触发 `onRouterUpdate`

```javascript
/****************************
 * 文件: /koot.config.js
 ***************************/
module.exports = {
    onRouterUpdate: './src/lifecycle/client-router-update'
}

/****************************
 * 文件: /src/lifecycle/client-router-update.js
 ***************************/
export default (...args) => {
    // 传入的参数与 `react-router` 相应的回调方法相同
}
```

---

## 服务器端设置 & 生命周期

### port

- 类型: `Number`
- 默认值: `8080`
- **仅针对**: 服务器端

服务器启动端口号。（开发环境默认会使用该端口号）

### renderCache

- 类型: `Object` 或 `Boolean`
- 默认值: `{ maxAge: 5000, maxCount: 50 }`
- **仅针对**: 服务器端，生产环境

生产环境下服务器渲染缓存相关设置。默认行为: 

- 根据**完整的** URL 进行缓存，即每个 URL 有各自的结果缓存
  - `/page-a/` 和 `/page-a/?a=b` 有不同的缓存
- 仅保留最近 **50** 个 URL 的结果
- 每条结果最多保存 **5秒**

```javascript
module.exports = {
    // 默认值
    renderCache: {
        maxAge: 5000,
        maxCount: 50
    },

    // 完全禁用渲染缓存
    renderCache: false,

    // 详细设置
    renderCache: {
        /** `renderCache.maxAge`
         * - 类型: `Number`
         * - 默认值: `5000`
         * 
         * 每条结果最多保存时间, 单位: 毫秒 (ms)
         */
        maxAge: 5000,

        /** `renderCache.maxCount`
         * - 类型: `Number`
         * - 默认值: `50`
         * 
         * 根据 URL 保留的结果条目数
         */
        maxCount: 50,

        /** `renderCache.get`
         * - 类型: `Function`
         * - 默认值: `undefined`
         * 
         * 自定义缓存检查与吐出方法。存在时, maxAge 和 maxCount 设置将被忽略
         * 
         * @param {String} url 请求的完整的 URL
         * @returns {Boolean|String} 返回 false 时，表示该 URL 没有缓存结果
         */
        get: (url) => {
            // 自实现的缓存结果获取逻辑
            // return false
            return '完整渲染结果'
        },

        /** `renderCache.set`
         * - 类型: `Function`
         * - 默认值: `undefined`
         * 
         * 自定义缓存存储方法。存在时, maxAge 和 maxCount 设置将被忽略
         * 
         * @param {String} url 请求的完整的 URL
         * @param {String} html 服务器渲染结果
         * @void
         */
        set: (url, html) => {
            // 自实现的缓存结果存储逻辑
        }
    },
}
```

### proxyRequestOrigin

- 类型: `Object`
- 默认值: `{}` (空对象)
- **仅针对**: 服务器端，生产环境

如果当前项目的 Node.js 服务器是通过其他代理服务器请求的（如 nginx 反向代理），可用这个配置声明原始请求的信息。

```javascript
module.exports = {
    // 默认值
    proxyRequestOrigin: {},

    // 详细设置
    proxyRequestOrigin: {
        /** `proxyRequestOrigin.protocol`
         * - 类型: `String`
         * 协议名
         */
        protocol: 'https',
    },
}
```

### koaStatic

- 类型: `Object`
- 默认值:
```javascript
{
    maxage: 0,
    hidden: true,
    index: 'index.html',
    defer: false,
    gzip: true,
    extensions: false
}
```
- **仅针对**: 服务器端

`koa-static` 静态资源服务器配置。配置方法与 `koa-static` 的官方方法相同。

### serverBefore

### serverAfter

### serverOnRender

---

## Webpack 相关

### webpackConfig

### webpackBefore

### webpackAfter

### moduleCssFilenameTest

### internalLoaderOptions

---

## 开发环境

### devPort

- 类型: `Number`
- 默认值: 配置项 `port` 的值
- **仅针对**: 开发环境

开发环境端口号。

### devDll

### devHmr

### devServer

---

## 其他

### CSS 打包

_**Object**_ `css`

- _Object_ `css.fileBasename`
<br>文件名规则，不包含扩展名部分。规则会自动应用到 `.css` `.less` `.sass` 和 `.scss` 文件上
  - _RegExp_ `css.fileBasename.normal`
<br>标准 CSS 文件，在打包时不会被 koot 定制的 css-loader 处理
  - _RegExp_ `css.fileBasename.component`
<br>组件 CSS 文件，在打包时会被 koot 定制的 css-loader 处理

```javascript
// 默认配置
module.exports = {
    // ...
    css: {
        fileBasename: {
            normal: /^((?!\.component\.).)*$/,
            component: /\.component$/,
        }
    },
    // ...
}
```

有关 CSS 的使用请查阅 [CSS](/css)

### Webpack

_**Object**_ `webpack`

- _Array_ `webpack.dll`
<br>**仅开发环境**
<br>供 `webpack.DllPlugin` 使用。webpack 的监控不会处理这些库/library，以期提高开发环境的打包更新速度。
- _Object_ `webpack.hmr`
<br>**仅开发环境**
<br>插件 `webpack.HotModuleReplacementPlugin` 的配置对象。
<br>如果遭遇在开发环境下在保存文件后 `webpack` 不断无限的刷新打包的问题，请配置该项为 `{ multiStep: false }`
- _Object_ `webpack.internalLoadersOptions`
<br>用以扩展几乎无法修改的内置 `loader` 所用的设置，目前支持：
  - `less-loader`
  - `sass-loader`

```javascript
// 默认配置
module.exports = {
    // ...
    webpack: {
        dll: [
            'react',
            'react-dom',
            'redux',
            'redux-thunk',
            'react-redux',
            'react-router',
            'react-router-redux',
            'koot',
        ],
        hmr: {},
        internalLoadersOptions: {}
    },
    // ...
}
```

### 服务器端

_**Object**_ `server` _仅针对同构项目_

- _Object_ `server.koaStatic`
<br>**暂不可用**
<br>Koot.js 使用 KOA 作为 Node.js 服务器程序，同时使用 `koa-static` 中间件处理静态文件请求。该对象可对 `koa-static` 进行配置。
- _Object_ `server.renderCache`
<br>**仅生产模式**
<br>同构 HTML 结果缓存设置。
  - _Number_ `server.renderCache.maxAge`
<br>同构渲染缓存最大存在时间 (单位: ms)
  - _Number_ `server.renderCache.maxCount`
<br>同构渲染缓存最多缓存的结果的数量（基于 URL）
- _Object_ `server.proxyRequestOrigin`
<br>**仅生产模式**
<br>若本 Node.js 服务器是通过其他代理服务器请求的（如 nginx 反向代理），可用这个配置对象声明原请求的信息
  - _String_ `server.proxyRequestOrigin.protocol`
<br>协议名
- _Pathname:Object_ `server.reducers`
<br>服务器端专用 Reducer，与 `combineReducers` 参数相同。会整合到 `redux.combineReducers` 中
- _Pathname:Object_ `server.inject`
<br>模板注入内容
- _Pathname:Function_ `server.before`
<br>回调：在服务器启动前
- _Pathname:Function_ `server.after`
<br>回调：在服务器启动完成
- _Pathname:Function_ `server.onRender`
<br>回调：在页面渲染时 (同步数据到 store 之前)
- _Object_ `server.onRender`
<br>回调：在页面渲染时 (细节设定)
  - _Pathname:Function_ `server.onRender.beforeDataToStore`
  <br>在服务器同步数据到 store 之前
  - _Pathname:Function_ `server.onRender.afterDataToStore`
  <br>在服务器同步数据到 store 之后

```javascript
// 默认配置
module.exports = {
    // ...
    server: {
        koaStatic: {},
        renderCache: {
            maxAge: 1000,
            maxCount: 50
        },
        proxyRequestOrigin: {
            protocol: undefined
        },
        reducers: undefined,
        inject: undefined,
        before: undefined,
        after: undefined,
        onRender: undefined
    },
    // ...
}
```
```javascript
// 示例配置
module.exports = {
    // ...
    server: {
        koaStatic: {
            gzip: false,
        },
        renderCache: {
            maxAge: 5 * 1000,
            maxCount: 100
        },
        proxyRequestOrigin: {
            protocol: 'https'
        },
        reducers: undefined,
        inject: './server/inject',
        before: './server/lifecycle/before',
        after: './server/lifecycle/after',
        onRender: {
            beforeDataToStore: './server/lifecycle/on-render-before-data-to-store',
            afterDataToStore: './server/lifecycle/on-render-after-data-to-store'
        }
    },
    // ...
}
```
