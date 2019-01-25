# 其他

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
