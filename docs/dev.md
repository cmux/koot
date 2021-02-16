# 开发环境服务器

_Koot.js_ 针对项目类型有着不同的开发环境模式

-   SPA: 使用 `webpack-dev-server` 作为开发环境服务器
-   SSR: 共有 4 个服务器
    -   主 Web 服务器，负责提供主路由控制以及向其他各个服务器提供代理转发
    -   客户端开发服务器，使用 `webpack-dev-server`，负责客户端的热更新
    -   服务器端开发服务器，使用 Node Watch 模式负责服务器端代码的热更新
    -   服务器端 SSR 服务器，运行服务器端开发服务器的打包结果

---

### 开发环境专属配置

请参阅 [项目配置/开发环境 & 开发设置](/config?id=%e5%bc%80%e5%8f%91%e7%8e%af%e5%a2%83-amp-%e5%bc%80%e5%8f%91%e8%ae%be%e7%bd%ae)

---

### 代码检测于自动修正

_Koot.js_ 自身并未提供相关功能。

如有相关需求，我们推荐使用 [koot-eslint](https://github.com/cmux/koot-eslint)，包含一整套 _ESLint_ 配置，以及完整的自动代码修正、Commit 检查等配置方案。
