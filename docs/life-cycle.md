# Koot.js 生命周期

_Koot.js_ 为客户端和服务器端分别提供了生命周期，可编写回调函数在相应的周期上执行操作。

---

### 客户端

在浏览器中运行的代码。

配置方式请查阅 [项目配置/客户端生命周期](/config?id=客户端生命周期)。

| 方法                                   | 执行时机                                  |
| -------------------------------------- | ----------------------------------------- |
| `before({ store, history, localeId })` | React 代码执行/初始化之前                 |
| `after({ store, history, localeId })`  | React 代码执行/初始化之后                 |
| `onHistoryUpdate(location, store)`     | URL 或历史记录 (由 `history` 管理) 更新时 |
| `onRouterUpdate()`                     | 路由 (由 `react-router` 管理) 更新时      |

如果路由对应组件进行了代码分割，则会按顺序进行以下行为

1. 客户端/浏览器 URL 或历史记录改变之后即刻触发 `onHistoryUpdate`
2. 载入对应组件的代码 (如果已载入则跳过该步骤)
3. 渲染相应组件
4. 触发 `onRouterUpdate`

---

### 服务器端

**仅针对: 同构/SSR 项目**

在 Node.js 环境中运行的代码。

配置方式请查阅 [项目配置/服务器端设置 & 生命周期](/config?id=服务器端设置-amp-生命周期)。

| 方法                                                               | 执行时机                                                    |
| ------------------------------------------------------------------ | ----------------------------------------------------------- |
| `async serverBefore({ koaApp })`                                   | 服务器端创建 Koa 实例后、挂载任何中间件之前                 |
| `async serverAfter({ koaApp })`                                    | 服务器端 Koa 挂载所有中间件后、正式启动服务器服务之前       |
| `async serverOnRender({ ctx, store, localeId })`                   | 路由 (`react-router`) 匹配之后、进行 store 相关数据计算之前 |
| `async serverOnRender.beforeRouterMatch({ ctx, store })`           | 路由 (`react-router`) 匹配之前                              |
| `async serverOnRender.beforePreRender({ ctx, store, localeId })`   | 路由 (`react-router`) 匹配之后、进行预渲染之前              |
| `async serverOnRender.beforeDataToStore({ ctx, store, localeId })` | 预渲染之后、进行 store 相关数据计算之前                     |
| `async serverOnRender.afterDataToStore({ ctx, store, localeId })`  | 进行 store 相关数据计算之后                                 |

#### 服务器端渲染流程

每次请求的渲染都会经过以下流程：

> _**> 粗斜体 <**_ 表示可执行的生命周期回调

> `END` 表示渲染流程结束

1. 创建 `store`
2. 创建 `memoryHistory` / `staticHistory`
3. _**> beforeRouterMatch() <**_
4. (如果启用了多语言) 确定当前访问的语言
5. 匹配路由
    - 如果需要重定向，进行重定向 **`END`**
    - 如果没有匹配，不处理该请求，交给 KOA 进行后续处理 **`END`**
6. _**> beforePreRender() <**_
7. 预渲染 React 为 string
    - 预渲染用以确定此次渲染流程中使用的组件
    - 预渲染过程中，相关组件会进行渲染，其 `constructor()` `render()` 等生命周期会执行
    - 通常情况下无需针对性该过程进行调整
8. 重置/清空 `store`
9. _**> beforeDataToStore() <**_
10. 执行使用了 `connect()` 高阶组件的相关的静态方法
    - `pageinfo` `data` 均会在此时执行并确定
11. _**> afterDataToStore() <**_
12. 正式渲染 React 为 string
13. 渲染 EJS 摸板
14. 吐出结果 **`END`**
