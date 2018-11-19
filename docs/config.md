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

- _Array_ `webpack.dll`
<br>**仅开发模式** 供 `webpack.DllPlugin` 使用。webpack 的监控不会处理这些库/library，以期提高开发模式的打包更新速度


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
