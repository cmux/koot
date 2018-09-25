# HTML 内容注入

HTML 内容注入主要是只在SSR阶段，根据HTTP请求，动态的向```HTML模板```里插入代码。

### HTML 模板

默认情况，模板文件在 ```/src/template.ejs```

```ejs
<!DOCTYPE html>
<html>

<head<%- inject.htmlLang %>>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no">

    <title><%= inject.title %></title>

    <base target="_self">

    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="format-detection" content="telephone=no,email=no,address=no">
    <meta name="format-detection" content="email=no">
    <meta name="format-detection" content="address=no">
    <meta name="format-detection" content="telephone=no">
    <meta name="HandheldFriendly" content="true">
    <meta name="mobile-web-app-capable" content="yes">

    <!-- IE/Edge/Multi-engine -->
    <meta name="renderer" content="webkit">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">

    <!-- iOS Safari -->
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">

    <!-- Customize -->
    <meta name="theme-color" content="#0092f5" />

    <%- inject.metas %>
    <%- inject.styles %>
</head>

<body>
    <div id="main-loader"></div>
    <div id="root"><%- inject.react %></div>
    <%- inject.scripts %>
</body>

</html>

<%- inject.performanceInfos %>
`

```

### 注入变量

从上面的```HTML模板```里可以看见很多个```<%- inject.[*] %>```标签，这样的标签会在```SSR```阶段被动态替换成配置文件里的对应代码。
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


### 默认注入项

以下注入项会默认启用，只要模板中有响应的 ``inject.[*]`` 即会自动替换为对应结果

注入变量 | 时机 | 内容说明
- | - | -
htmlLang | 页面渲染 | 当前请求匹配到的语言 ID
title | 页面渲染 | 页面标题，受多语言影响
metas | 页面渲染 | &lt;meta&gt; 标签
styles | 页面渲染 | 同构结果的全部 CSS 代码
react | 页面渲染 | 同构结果的全部 HTML 代码
scripts | 页面渲染 | 默认使用的外部 JS 代码和文件引用
