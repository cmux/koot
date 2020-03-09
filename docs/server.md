# 生产环境服务器

---

### SSR

**Node.js 服务器**

针对 SSR/同构项目，_Koot.js_ 会自动生成一个 _Node.js_ 服务器，运行打包结果目录下的 `index.js` 文件即可启动该服务器。

**端口**

服务器端口会默认采用项目配置中的 `port` 值或默认值 `8080`。

端口也允许在启动时动态设置：在服务器启动前设置环境变量 `SERVER_PORT`。以下方法均可实现：

-   在 NPM 命令中直接修改环境变量（该方法推荐使用 `cross-env`）
    <br>`cross-env SERVER_PORT=3080 && node dist/index.js`
-   使用任务管理，如 `pm2`，在启动时设置环境变量

**渲染缓存**

_Koot.js_ 提供一套简易的渲染缓存，该功能默认禁用，项目可以选择开启。

简易渲染缓存规则:

-   根据**完整的** URL 进行缓存，即每个 URL 有各自的结果缓存
    -   `/page-a/` 和 `/page-a/?a=b` 有不同的缓存
-   仅保留最近 **renderCache.maxCount** 个 URL 的结果
-   每条结果最多保存 **renderCache.maxAge** 毫秒
-   **没有**考虑 _Redux store_ 内的数据
    -   如：相同的 URL 根据 _store_ 数据有不同结果，如针对当前登录的用户显示欢迎信息。该默认规则下，不同的用户在 5 秒内先后访问，后访问的用户会得到上一个用户访问的结果，这显然不是我们想要的
    -   如有类似需求，请**禁用**默认的缓存规则，自行编写缓存规则

如需禁用、调整默认缓存规则或需要自行编写缓存规则，请查阅 [项目配置/renderCache](/config?id=renderCache)。

**serverless**

_Koot.js_ 支持输出 Serverless 模式的服务器脚本。如需启用该支持，请查阅 [项目配置/serverless](/config?id=serverless)。

---

### SPA

针对 SPA 项目，_Koot.js_ 会自动生成一个简易的 _Node.js_ 静态资源服务器。该服务器的 JavaScript 启动文件位于打包结果目录中下的 `.server/index.js`。

该 _Node.js_ 服务器非常简易，仅负责提供静态文件的访问。

类似 SSR 服务器，可通过项目配置或环境变量设置端口。

包括渲染缓存、服务器启动前后的生命周期等的行为或配置，均不可用。
