# Koot.js 生命周期

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

### 服务端

在 Node.js 环境中运行的代码。

配置方式请查阅 [项目配置/服务器端设置 & 生命周期](/config?id=服务器端设置-amp-生命周期)。

| 方法                                                               | 执行时机                                                    |
| ------------------------------------------------------------------ | ----------------------------------------------------------- |
| `async serverBefore({ koaApp })`                                   | 服务器端创建 Koa 实例后、挂载任何中间件之前                 |
| `async serverAfter({ koaApp })`                                    | 服务器端 Koa 挂载所有中间件后、正式启动服务器服务之前       |
| `async serverOnRender({ ctx, store, localeId })`                   | 路由 (`react-router`) 匹配之后、进行 store 相关数据计算之前 |
| `async serverOnRender.beforeRouterMatch({ ctx, store })`           | 路由 (`react-router`) 匹配之前                              |
| `async serverOnRender.beforeDataToStore({ ctx, store, localeId })` | 路由 (`react-router`) 匹配之后、进行 store 相关数据计算之前 |
| `async serverOnRender.afterDataToStore({ ctx, store, localeId })`  | 进行 store 相关数据计算之后                                 |
