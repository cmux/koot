# 项目配置

项目根目录中的 `/koot.config.js` 为 koot 项目总配置文件

### `css`

CSS 打包相关设置

- _Object_ `css.fileBasename`
<br>文件名规则，不包含扩展名部分。规则会自动应用到 `.less` `.sass` 和 `.scss` 文件上
- _RegExp_ `css.fileBasename.normal`
<br>标准 CSS 文件，在打包时不会被 koot 定制的 css-loader 处理
- _RegExp_ `css.fileBasename.component`
<br>组件 CSS 文件，在打包时会被 koot 定制的 css-loader 处理
- _Array_ `css.extract`
<br>这些文件在打包时会拆分成独立文件
<br>_注_: 目前仅支持标准 CSS 文件的拆分

```javascript
// 默认配置
module.exports = {
    // ...
    css: {
        fileBasename: {
            normal: /^((?!\.component\.).)*$/,
            component: /\.component$/,
        },
        extract: [
            /critical\.css$/,
            /critical\.less$/,
            /critical\.sass$/
        ]
    }
    // ...
}
```

### `webpack`

Webpack 打包相关配置

- _Array_ `webpack.dll` (可选)
<br>**仅开发模式** 供 `webpack.DllPlugin` 使用。webpack 的监控不会处理这些库/library，以期提高开发模式的打包更新速度。
- _Object_ `webpack.hmr` (可选)
<br>**仅开发模式** `webpack.HotModuleReplacementPlugin` 插件的配置对象。
<br>如果遭遇在开发模式下在保存文件后 `webpack` 不断无限的刷新打包的问题，请配置该选项为 `{ multiStep: false }`

### `redux`

允许服务器端在同构时将 `cookie` 中对应的项同步到 redux state 的 `server.cookie` 中

```javascript
// 默认配置
module.exports = {
    // ...
    redux: {
        // ...
        syncCookie: []
    }
    // ...
}

// 可用配置
redux.syncCookie = 'token' // 单参数
redux.syncCookie = ['token', 'sid'] // 支持多参数
redux.syncCookie = false // 不同步cookie
```

### `server`

_仅针对同构项目_

服务器相关配置

- _Object_ `server.koaStatic` (可选)
<br>**暂不可用** Koot.js 使用 KOA 作为 Node.js 服务器程序，同时使用 `koa-static` 中间件处理静态文件请求。使用对象可对 `koa-static` 进行配置。
- _Object_ `server.renderCache` (可选)
<br>**仅生产模式** 同构 HTML 结果缓存设置。
  - _Number_ `server.renderCache.maxAge`
<br>同构渲染缓存最大存在时间 (单位: ms)。默认值：1000
  - _Number_ `server.renderCache.maxCount`
<br>同构渲染缓存最多缓存的结果的数量（基于 URL）。默认值：50
- _Object_ `server.proxyRequestOrigin` (可选)
<br>**仅生产模式** 若本 Node.js 服务器是通过其他代理服务器请求的（如 nginx 反向代理），可用这个配置对象声明原请求的信息
  - _String_ `server.proxyRequestOrigin.protocol`
<br>协议名
- _Pathname:Object_ `server.reducers` (可选)
<br>服务器端专用 Reducer，与 `combineReducers` 参数相同。会整合到 `redux.combineReducers` 中
- _Pathname:Object_ `server.inject` (可选)
<br>模板注入内容
- _Pathname:Function_ `server.before` (可选)
<br>回调：在服务器启动前
- _Pathname:Function_ `server.after` (可选)
<br>回调：在服务器启动完成
- _Pathname:Function_ `server.onRender` (可选)
<br>回调：在页面渲染时
