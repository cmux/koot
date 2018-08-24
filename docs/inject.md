# HTML注入

HTML注入主要是只在SSR阶段，根据HTTP请求，动态的向```HTML模板```里插入代码。

### HTML模板

默认情况，模板文件在 ```/src/html.js```。
如下：
```js
export default `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title><script>//inject_title</script></title>
        <script>//inject_metas</script>
        <script>//inject_css</script>
        <script>//inject_style</script>
    </head>
    <body>
        <div id="boat-loader">LOADING...</div>
        <div id="root"><script>//inject_react</script></div>
        <script>//inject_redux</script>
        <script>//inject_js</script>
    </body>
    </html>
`

```

### 注入变量

从上面的```HTML模板```里可以看见很多个```<script>//inject_[*]</script>```标签，这样的标签会在```SSR```阶段被动态替换成配置文件里的对应代码。
配置文件: ```/koot.js```中，```export const server = { inject }```的```inject```会指定对应关系所在的文件。

默认配置是：
```js
// File: /koot.js

export const server = {
    inject: require('./src/server/lifecycle/inject').default
}
```

```js
// File: /src/server/lifecycle/inject.js

import getClientFilePath from 'koot/utils/get-client-file-path'
export default {
    js: [getClientFilePath('client.js')], // 对应标签 <script>//inject_js</script>
    // css: [...],
    // ... 
    // 可自行扩展
}
```
默认打包方式会把打包后的文件加上```[hash]```值，所以```koot.js```框架提供了找到被 hash 后新文件名的方法。

如：```getClientFilePath('client.js')``` => ```client.8f0f500307dec12480a2.js```


### 注入时机

注入到HTML模板的代码可能是每个页面都需要的，也可能是在特定页面才需要的，所以为了减少字符串匹配的性能消耗，我们把每个页面都需要的注入标签在服务端程序启动时就替换好，有特定需求的会在页面被渲染时候才注入。

注入变量 | 时机 | 必填 | 说明
- | - | -
js | 服务端启动 | 是 |一般是 client.js
css | 服务端启动 | 否 | 可选，可自定义浏览器预加载的 CSS
title | 页面渲染 | 否 | 页面标题
metas | 页面渲染 | 否 | <meta> 标签
redux | 页面渲染 | 是 | 服务端准备好的 redux store
react | 页面渲染 | 是 | React 在服务端渲染好的 HTML 代码
style | 页面渲染 | 是 | React 在服务端渲染好的 CSS 代码
