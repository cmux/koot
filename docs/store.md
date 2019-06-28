# Store

_Koot.js_ 使用 _Redux_ 进行 _store_ 的管理。

所有的 _Koot.js_ 项目都会默认生成 _Redux store_，用以管理一些必要的数据。开发者可以通过项目配置添加 _reducer_、中间件，或使用 _Koot.js_ 提供的创建函数自行生成 _store_。

---

## 相关配置

以下是和 _store_ 相关的配置项目：

-   `store`
    <br>生成 _Redux store_ 的方法函数。
-   `cookiesToStore`
    <br>将 _cookie_ 写入到 _Redux store_ 中的 `state.server.cookie`。
-   `sessionStore`
    <br>将全部或部分 _store_ 对象同步到浏览器/客户端的 `sessionStore` 中，在用户刷新页面后，这些值会被还原到 _store_，以确保和刷新前一致。

具体配置方式请查阅：[项目配置](/config?id=store)。

---

## 创建 store

项目中使用的 _Redux store_ 需要自行创建。

创建方式请查阅：[项目配置/store](/config?id=store)。

---

## 默认存在的属性

在 _store_ 中有一些默认会存在的属性，可供项目任意使用。请注意在创建 `combineReducer` 时不要和这些属性命名冲突。

-   `localeId`
    <br>当前渲染的语种
-   `routing`
    <br>路由信息。该对象内有名为 `locationBeforeTransitions` 的对象，其中包含相关的原始信息
-   `server`
    <br>本次请求的相关服务器信息，包括：
    -   `cookie`
        <br>本次请求的全部 cookie 内容
    -   `lang`
        <br>当前渲染的语种。与 `localeId` 相同
    -   `origin`
        <br>本次请求的 URL 源
