# 项目配置

项目根目录中的 `/koot.config.js` 为 koot 项目总配置文件。

如无特殊说明，所有配置均为可选配置项。

### 基本信息

_**String**_ `name` 项目名称。以下场景会使用该值作为默认值
- SPA 的主 HTML 页面的标题

_**String**_ `type` 项目类型。目前支持以下类型
- `react` - React 同构
- `react-spa` - React SPA

_**Pathname**_ `template` HTML 模板文件路径。目前仅支持 `.ejs` 文件。有关模板的使用请查阅 [HTML 模板](/template)

_**Pathname**_ `dist` 打包结果路径

### 路由

_**Object**_ `router`

### Redux

_**Object**_ `redux`

- _String_|_Array_|_Boolean_ `redux.syncCookie`
<br>允许服务器端在同构时将 `cookie` 中对应的项同步到 redux state 的 `server.cookie` 中

```javascript
// 默认配置
module.exports = {
    // ...
    redux: {
        // ...
        syncCookie: false
    },
    // ...
}

// redux.syncCookie 可用配置
redux.syncCookie = false // 不同步 cookie (默认值)
redux.syncCookie = true // 同步所有 cookie
redux.syncCookie = 'token' // 单参数
redux.syncCookie = ['token', 'sid'] // 支持多参数
```

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
<br>**仅开发模式**
<br>供 `webpack.DllPlugin` 使用。webpack 的监控不会处理这些库/library，以期提高开发模式的打包更新速度。
- _Object_ `webpack.hmr`
<br>**仅开发模式**
<br>插件 `webpack.HotModuleReplacementPlugin` 的配置对象。
<br>如果遭遇在开发模式下在保存文件后 `webpack` 不断无限的刷新打包的问题，请配置该项为 `{ multiStep: false }`
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

### 客户端/浏览器端

_**Object**_ `client`

- _String_ `client.historyType`
<br>客户端中路由 (`router`) 所用的历史对象 (`history`) 类型。目前支持：
  - `browser` _browserHistory_ (同构模式默认使用)
  - `hash` _hashHistory_ (SPA 模式默认使用)

```javascript
// 默认配置
module.exports = {
    // ...
    client: {
        historyType: undefined
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
<br>回调：在页面渲染时
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

### 多语言

_**Boolean**_ `i18n`

`i18n = false` 时，不启用多语言。不支持 `true`

```javascript
// 默认配置 (不启用多语言支持)
module.exports = {
    // ...
    i18n: false,
    // ...
}
```

_**Array**_ `i18n`

简易配置方式
- `Array` 中每一项也为 `Array`，其中第一个元素为语种ID，第二个元素为语言包文件路径
- 采用此方式时，其他多语言相关选项均采用默认值（见下）
- 第一条为默认语种

```javascript
// 示例配置 (简易)
module.exports = {
    // ...
    i18n: [
        ['zh', './src/locales/zh.json'],
        ['zh-tw', './src/locales/zh-tw.json'],
        ['en', './src/locales/en.json']
    ],
    // ...
}
```

_**Object**_ `i18n`

完整配置方式

- _Array_ `i18n.locales`
<br>语种ID和语言包，参见上文简易配置
- _String_ `i18n.type`
<br>**仅生产模式**
<br>多语言打包模式，目前支持
  - `default` (默认) 客户端按语种分别打包，语言包内容会直接打入到代码中，代码结果中不存在“语言包对象”
  <br>适合所有项目使用，推荐语言包较大的项目使用
  - `redux` 服务器输出 HTML 时，当前语种的语言包对象会写入 Redux store
  <br>适合语言包较小，或对文件/请求体积不敏感的 WebApp 项目使用
  <br>开发模式下会强制使用这一模式
- _String_ `i18n.use`
<br>使用 URL 切换语种的方式，目前支持
  - `query` (默认) 一般情况下，URL 中不会存在有关语种的字段。切换语种时使用名为 `hl` 的 URL 参数，如：
    - `https://some.project.com/?hl=zh-cn`
    - `https://some.project.com/list/articles/?page=10&hl=ja-jp`
  - `router` 规定路由的第一层为语种ID。如果访问 URL 的路由第一层不是项目设定的已知的语种 ID，则会自动跳转到最近一次访问的语种或默认语种对应的页面。URL 示例：
    - `https://some.project.com/` 自动跳转到 `https://some.project.com/zh-cn/`
    - `https://some.project.com/ja-jp/list/articles/?page=10`
- _String_ `i18n.expr`
<br>JS 代码中多语言翻译方法名
- _String_ `i18n.domain`
<br>Cookie 影响的域
- _String_ `i18n.cookieKey`
<br>语种ID存储于 Cookie 中的字段名

```javascript
// 默认配置 (启用多语言支持)
module.exports = {
    // ...
    i18n: {
        locales: [],
        type: 'default',
        use: 'query',
        expr: '__',
        domain: undefined,
        cookieKey: 'spLocaleId'
    },
    // ...
}
```
```javascript
// 示例配置
module.exports = {
    // ...
    i18n: {
        locales: [
            ['zh', './src/locales/zh.json'],
            ['zh-tw', './src/locales/zh-tw.json'],
            ['en', './src/locales/en.json']
        ],
        type: 'redux',
        use: 'router'
    },
    // ...
}
```

关于多语言的使用和相关规则请查阅 [多语言](/i18n)

### 路径别名

_**Object**_ `aliases`

### 服务器端口

_**Number|Object**_ `port`

### PWA

_**Object**_ `pwa`

### 静态资源

_**Pathname**_ `staticAssets`

### 开发服务器

_**Object**_ `devServer`
