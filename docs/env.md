# 环境变量

_Koot.js_ 提供以下环境变量，可以在项目内几乎所有的 Javascript 文件中使用。

- `WEBPACK_BUILD_TYPE` 当前项目的模式
  - `isomorphic` 默认，SSR / 同构
  - `spa` SPA
- `WEBPACK_BUILD_STAGE` 当前针对的端
  - `client` 默认，客户端
  - `server` 浏览器端
- `WEBPACK_BUILD_ENV` 当前的环境
  - `dev` 默认，开发环境
  - `prod` 生产环境
- `SERVER_PORT` 服务器启动端口号
- `KOOT_VERSION` Koot.js 版本号
- `KOOT_PROJECT_NAME` 项目名，koot 配置文件中的 `name`
- `KOOT_PROJECT_TYPE` 项目类型，koot 配置文件中的 `type`
- `KOOT_HISTORY_TYPE` 项目 History 类型，koot 配置文件中的 `historyType`

使用示例

```javascript

// 根据当前的运行环境，决定 API 请求前缀
const apiBase = process.env.WEBPACK_BUILD_ENV === 'dev'
    ? 'http://dev-api.project.com'
    : 'https://api.project.com';

// React 组件，在客户端和服务器端分别渲染不同的内容
render() {
    if (process.env.WEBPACK_BUILD_STAGE === 'server')
        return null
    return (
        <div>
            {/* */}
        </div>
    )
}

```

### 可修改的环境变量

大多数环境变量均不建议自行修改。

以下环境变量可安全的根据项目要求进行修改（如 pm2 启动配置中）：

- `SERVER_PORT`
