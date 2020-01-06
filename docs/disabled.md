# 默认关闭的功能

为了满足多方面的开发需求，_Koot.js_ 有着许多功能，其中有部分功能默认为关闭或禁用状态，以下是目前所有默认关闭的功能的列表：

### sessionStore

将全部或部分 _store_ 对象同步到浏览器/客户端的 `sessionStorage` 中，在用户刷新页面后，这些值会被还原到 _store_，以确保和刷新前一致。

-   请参见 [项目配置/sessionStore](/config?id=sessionStore)

### i18n

完整的多语言支持。

-   请参见 [项目配置/i18n](/config?id=i18n)

### staticCopyFrom

将目标目录内的所有文件复制到打包结果内的静态服务器目录中。

-   请参见 [项目配置/staticCopyFrom](/config?id=staticCopyFrom)

### renderCache

生产环境下服务器渲染缓存相关设置。

-   请参见 [项目配置/renderCache](/config?id=renderCache)

### proxyRequestOrigin

如果当前项目的 Node.js 服务器是通过其他代理服务器请求的（如 nginx 反向代理），可用这个配置声明原始请求的信息。

-   请参见 [项目配置/proxyRequestOrigin](/config?id=proxyRequestOrigin)
