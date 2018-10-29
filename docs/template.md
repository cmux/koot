# HTML 模板

同构与 SPA 模式均默认使用 HTML 模板文件。HTML 模板文件采用 `.ejs` 格式，遵循 `ejs` 语法。

### 模板文件

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

从上面的```HTML模板```里可以看见很多个```<%- inject.[*] %>```标签，这样的标签会被替换成对应的结果。
在配置文件中，```server.inject``` 选项可指定自定义注入方法的文件。

默认配置是：
```js
// File: /koot.config.js

// ...
server: {
    inject: './server/inject'
}
// ...
```

```js
// File: /server/inject.js

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

### EJS 语法扩展

`pathanme(文件名)`

将 `文件名` 对应的文件的 **URL 访问地址**注入到模板中。

`文件名` 为 `webpack` 配置中的入口 (`entry`)，需添加扩展名。

例:
```ejs
<script type="text/javascript" src="<%- pathname('entry.js') %>"></script>
```

`content(文件名)`

将 `文件名` 对应的文件的**文件内容**注入到模板中。

`文件名` 的解释参见上文。

例:
```ejs
<style><%- content('critical.css') %></style>
```
