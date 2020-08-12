# HTML 模板

SSR 与 SPA 模式均默认使用 HTML 模板文件。HTML 模板文件采用 `.ejs` 格式，遵循 `ejs` 语法。

---

### 模板文件

默认配置下，`/src/index.ejs` 为模板文件。以下是默认的模板文件内容：

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

    <!-- IE/Edge/Multi-engine -->
    <meta name="renderer" content="webkit">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">

    <%- inject.metas %>
    <%- inject.styles %>
</head>

<body class="koot-system">
    <div id="root"><%- inject.react %></div>
    <script type="text/javascript"><%- content('critical.js') %></script>
    <%- inject.svgIconPack %>
    <%- inject.scripts %>
</body>

</html>

<%- inject.performanceInfos %>
```

---

### 注入变量

从上面的 `HTML模板` 里可见多个 `<%- inject.[*] %>` 标签，这样的标签会被替换成对应的结果。
在配置文件中，`templateInject` 选项可指定自定义注入方法的文件。

示例配置：

```js
// File: /koot.config.js
module.exports = {
    // ...
    templateInject: './src/index.inject.js',
    // ...
};
```

```js
// File: /src/index.inject.js

export default {
    performanceInfos: () => `<!-- rendered: ${new Date().toISOString()} -->`,
    svgIconPack: __SVG_ICON_PACK__,
};
```

### 注入函数

注入的变量可以是函数 (如上例的 `performanceInfos`)。在服务器渲染页面 (同构/SSR 项目) 或生成模板文件 (SPA 项目) 时，对应的函数会自动执行。

注入函数有以下特征和要求

-   必须是同步函数，同时函数逻辑中不允许出现异步方法。异步方法和异步函数暂不支持
-   必须返回 `string`
-   对于同构/SSR 项目，会传入 3 个参数：
    -   `template`
        _string_ EJS 模板文件源代码
    -   `state`
        _Object_ 当前的 store state
    -   `ctx`
        _Object_ 此次访问的 KOA `ctx` 对象
-   对于 SPA 项目，会传入 1 个参数：
    -   `template`
        _string_ EJS 模板文件源代码

### 默认注入项

以下注入项会默认启用，只要模板中有对应的 `inject.[*]` 即会自动替换为对应结果

| 注入变量 | 内容说明                                                   |
| -------- | ---------------------------------------------------------- |
| htmlLang | 当前请求匹配到的语言 ID                                    |
| title    | 页面标题，受多语言影响                                     |
| metas    | &lt;meta&gt; 标签，包含 Web App 相关信息、多语言跳转链接等 |
| styles   | 同构结果的全部 CSS 代码                                    |
| react    | 同构结果的全部 HTML 代码                                   |
| scripts  | 默认使用的外部 JS 代码和文件引用                           |

---

### EJS 语法扩展

**pathanme(文件名)**

将 `文件名` 对应的文件的 **URL 访问地址**注入到模板中。

`文件名` 为 `webpack` 配置中的入口 (`entry`)，需添加扩展名。

例:

```ejs
<script type="text/javascript" src="<%- pathname('entry.js') %>"></script>
```

**content(文件名)**

将 `文件名` 对应的文件的**文件内容**注入到模板中。

`文件名` 的解释参见上文。

例:

```ejs
<style><%- content('critical.css') %></style>
```
