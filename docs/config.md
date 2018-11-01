# 项目配置

项目根目录中的 `/koot.config.js` 为 koot 项目总配置文件

### `css`

CSS 打包相关设置

- _Object_ `css.test`
<br>文件名规则。规则会自动应用到 `.less` `.sass` 和 `.scss` 文件上
- _RegExp_ `css.test.normal`
<br>标准 CSS 文件，在打包时不会被 koot 定制的 css-loader 处理
- _RegExp_ `css.test.component`
<br>组件 CSS 文件，在打包时会被 koot 定制的 css-loader 处理
- _Array_ `css.extract`
<br>这些文件在打包时会拆分成独立文件
<br>_注_: 目前仅支持标准 CSS 文件的拆分

```javascript
// 默认配置
module.exports = {
    // ...
    css: {
        test: {
            normal: /^((?!component).)*\.css$/,
            component: /\.component\.css$/,
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
