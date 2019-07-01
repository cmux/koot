# 环境变量

### 可直接使用的

针对不同的使用场景，_Koot.js_ 提供许多环境变量，可在项目代码中使用。

> 项目代码指所有经过 _Webpack_ 处理的 _JavaScript_ 文件的代码。通常来说，除了 _Koot.js_ 项目配置文件 (`koot.config.js`)、_Babel_ 配置文件 (babel.config.js) 等配置文件外，其他所有的代码文件都会经过 _Webpack_ 处理。

-   `WEBPACK_BUILD_TYPE` 当前项目的模式
    -   `isomorphic` 默认，SSR / 同构
    -   `spa` SPA
-   `WEBPACK_BUILD_STAGE` 当前针对的端
    -   `client` 默认，客户端
    -   `server` 服务器端
-   `WEBPACK_BUILD_ENV` 当前的环境
    -   `dev` 默认，开发环境
    -   `prod` 生产环境
-   `SERVER_PORT` 服务器启动端口号 / 开发服务器访问端口号
-   `KOOT_VERSION` Koot.js 版本号
-   `KOOT_PROJECT_NAME` 项目名，对应配置文件中的 `name`
-   `KOOT_PROJECT_TYPE` 项目类型，对应配置文件中的 `type`
-   `KOOT_HISTORY_TYPE` 项目 History 类型，对应配置文件中的 `historyType`

使用示例

```javascript
// 根据当前的运行环境，决定 API 请求源
const apiBase = process.env.WEBPACK_BUILD_ENV === 'dev'
    ? 'http://dev-api.project.com'
    : 'https://api.project.com';

// React 组件，在客户端和服务器端分别渲染不同的内容
const Comp = () => ({
    if (process.env.WEBPACK_BUILD_STAGE === 'server')
        return null;
    return (
        <div>
            {/* */}
        </div>
    );
});
```

### 可修改的

绝大多数环境变量不建议自行修改。

以下环境变量可安全的根据项目要求进行修改（如 pm2 启动配置中）：

-   `SERVER_PORT`

### 添加新变量

_Koot.js_ 项目支持在 NPM 命令中动态添加变量，这些变量会自动添加入环境变量，在项目代码中可以任意调用这些环境变量，如：

```bash
> npm start -- target=qa
```

```json
// package.json
{
    // ...
    "scripts": {
        "start": "koot-start -- target=qa"
    }
    // ...
}
```

```javascript
const apiBase = (() => {
    if (process.env.target === 'qa') return 'http://qa-api.project.com';
    if (process.env.WEBPACK_BUILD_ENV === 'dev')
        return 'http://dev-api.project.com';
    return 'https://api.project.com';
})();
```

注：

-   按 NPM 之规定，必须使用 `npm run [命令名] -- [参数]` 这样的命令格式
-   如果动态添加的变量名与已有的环境变量冲突，_Koot.js_ 会在启动阶段报错，提醒该错误
