# Store

_Koot.js_ 使用 _Redux_ 进行 _store_ 的管理。

所有的 _Koot.js_ 项目都会默认生成 _Redux store_，用以管理一些必要的数据。开发者可以通过项目配置添加 _reducer_、中间件，或使用 _Koot.js_ 提供的创建函数自行生成 _store_。

---

### 有关 react-redux 的版本

当前 _Koot.js_ 使用 `react-redux` 较旧的 v5 版本，该版本用到了 _React_ 计划弃用的一些生命周期 (如 `componentWillMount`)。

目前我们计划在今年会将 `react-redux` 升级到最新版本，同时确保已有项目的兼容性，敬请期待。

---

### 相关配置

以下是和 _store_ 相关的配置项目：

-   `store`
    <br>生成 _Redux store_ 的方法函数。
-   `cookiesToStore`
    <br>将 _cookie_ 写入到 _Redux store_ 中的 `state.server.cookie`。
-   `sessionStore`
    <br>将全部或部分 _store_ 对象同步到浏览器/客户端的 `sessionStore` 中，在用户刷新页面后，这些值会被还原到 _store_，以确保和刷新前一致。

具体配置方式请查阅：[项目配置](/config?id=store)。

---

### 创建 store

如果项目有使用 _Redux_ 的需求，需要提供创建 `store` 的函数。推荐使用全局函数 `createStore()` 创建 _Redux store_。

创建方式请查阅：[项目配置/store](/config?id=store)。

---

### 全局函数 `createStore`

_Koot.js_ 提供全局函数 `createStore()` 用以便捷的创建 _Redux store_。

`createStore([appReducer [, appMiddlewares [, appEnhancers] ] ])`

TS 定义

```typescript
import {
    Store,
    Middleware,
    Reducer,
    StoreEnhancer,
    ReducersMapObject
} from 'redux';

export const createStore: (
    appReducer?: Reducer | ReducersMapObject,
    appMiddlewares?: Array<Middleware>,
    appEnhancers?: Array<StoreEnhancer>
) => Store;
```

**参数**

-   `appReducer`
    <br>项目使用的 reducer，可为 `Reducer` (reducer 函数)，也可以为 `ReducersMapObject` (形式为 Object 的列表)
-   `appMiddlewares`
    <br>项目的中间件列表
-   `appEnhancers`
    <br>项目的 store 增强函数 (enhancer) 列表

---

### 默认存在的属性

在 _store_ 中有一些默认会存在的属性，可供项目任意使用。请注意在创建 `combineReducer` 时不要和这些属性命名冲突。

-   `localeId`
    <br>当前渲染的语种
-   `routing`
    <br>路由信息。该对象内有名为 `locationBeforeTransitions` 的对象，其中包含相关的原始信息
-   `server`
    <br>本次请求的相关服务器信息，包括：
    -   `cookie`
        <br>本次请求的 cookie 内容，由 `cookiesToStore` 配置决定其内容
    -   `lang`
        <br>当前渲染的语种。与 `localeId` 相同
    -   `origin`
        <br>本次请求的 URL 源

---

### 获取 store

通过全局函数 `getStore()`，项目代码中可以随时获取当前的 _Redux store_。

> 项目代码指所有经过 _Webpack_ 处理的 _JavaScript_ 文件的代码。通常来说，除了 _Koot.js_ 项目配置文件 (`koot.config.js`)、_Babel_ 配置文件 (`babel.config.js`) 等配置文件外，其他所有的代码文件都会经过 _Webpack_ 处理。

```javascript
import { getStore } from 'koot';

const actionUpdateUser = data =>
    getStore().dispatch({
        type: 'UPDATE_UESR',
        data
    });
```

---

### 刷新页面后还原 store

利用 `sessionStore` 配置，可实现将全部或部分 store 对象同步到浏览器/客户端的 sessionStore 中，在用户刷新页面后，这些值会被还原到 store，以确保和刷新前一致。

具体配置方式请查阅：[项目配置](/config?id=sessionStore)。
