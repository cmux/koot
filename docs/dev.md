# 开发环境

我们推荐在开发环境中使用 [koot-eslint](https://github.com/cmux/koot-eslint)。

相关 _ESLint_ 配置、自动更正代码、Commit hook 检查，请参阅：[koot-eslint](https://github.com/cmux/koot-eslint)。

_编写中..._

---

## 开发环境专属配置

### devPort

-   类型: `Number`
-   默认值: _无_ (默认使用配置项 `port` 的值)
-   **仅针对**: 开发环境

指定开发环境端口号。

```javascript
module.exports = {
    // 默认值 (默认使用配置项 `port` 的值)
    devPort: undefined,

    // 示例: 指定开发环境采用 8088 端口
    devPort: 8088
};
```

### devDll

-   类型: `Array`
-   默认值: _见下_
-   **仅针对**: 开发环境

开发环境中，将部分 NPM 包独立打包，在之后更新的过程中，这些 NPM 包不会参与热更新流程，从而加速热更新速度。

```javascript
module.exports = {
    // 默认值
    devDll: [
        'react',
        'react-dom',
        'redux',
        'redux-thunk',
        'react-redux',
        'react-router',
        'react-router-redux'
        // 以及其他常见的第三方库/包
    ]
};
```

### devHmr

-   类型: `Object`
-   默认值: _见下_
-   **仅针对**: 开发环境

扩展 Webpack 插件 `HotModuleReplacementPlugin` 的配置。

```javascript
module.exports = {
    // 默认值
    devHmr: {
        multiStep: false
    },

    // 开发环境下启动多步打包，以进一步加速热更新速度
    devHmr: {
        multiStep: true,
        fullBuildTimeout:
            process.env.WEBPACK_BUILD_TYPE === 'spa' ? 500 : undefined,
        requestTimeout:
            process.env.WEBPACK_BUILD_TYPE === 'spa' ? undefined : 1000
    }
};
```

### devServer

-   类型: `Object`
-   默认值: _见下_
-   **仅针对**: 开发环境

扩展 `webpack-dev-server` 配置对象。

```javascript
module.exports = {
    // 默认值
    devServer: {
        quiet: false,
        stats: { colors: true },
        clientLogLevel: 'error',
        hot: true,
        inline: true,
        historyApiFallback: true,
        contentBase: './',
        publicPath: TYPE === 'spa' ? '/' : '/dist/',
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        open: TYPE === 'spa',
        watchOptions: {
            ignored: [getDistPath(), path.resolve(getDistPath(), '**/*')]
        },
        before: app => {
            if (appType === 'ReactSPA') {
                require('../../ReactSPA/dev-server/extend')(app);
            }
            if (typeof before === 'function') return before(app);
        }
    }
};
```

### devServiceWorker

-   类型: `boolean` 或 `Object`
-   默认值: `false`
-   **仅针对**: 开发环境

设定开发环境中是否应用 _Service Worker_。有关独立配置对象请查阅 [Service Worker & PWA](/pwa)。

```javascript
module.exports = {
    // 默认值 - 开发环境中禁用 Service Worker
    devServiceWorker: false,

    // 开发环境中启用 Service Worker，采用 `serviceWorker` 配置对象
    devServiceWorker: true,

    // 开发环境中启用 Service Worker，采用独立配置对象
    // 配置项及其说明详见 Service Worker & PWA 章节 (链接见上文)
    devServiceWorker: {
        [option]: `value`
    }
};
```

### devMemoryAllocation

-   `koot >= 0.9`
-   类型: `Number` 或 `Object`
-   默认值: _无_
-   **仅针对**: 开发环境

指定开发环境中 node.js 分配的内存 (单位: MB)。

```javascript
module.exports = {
    // 默认值 (使用 node.js 默认)
    devMemoryAllocation: undefined,

    // SPA: 指定 `webpack-dev-server` (client) 分配的内存容量
    // SSR: 指定 `webpack-dev-server` (client) 和服务器打包进程 (server) 分配的内存容量
    devMemoryAllocation: 2048,

    // SSR: 分别指定 `webpack-dev-server` (client) 和服务器打包进程 (server) 分配的内存容量
    devMemoryAllocation: {
        client: 2048,
        server: 1024
    },

    // SSR: 仅指定 `webpack-dev-server` (client) 分配的内存容量
    devMemoryAllocation: {
        client: 2048
    },

    // SSR: 仅指定服务器打包进程 (server) 分配的内存容量
    devMemoryAllocation: {
        server: 1024
    }
};
```
