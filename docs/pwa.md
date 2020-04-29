# Service-Worker & PWA

---

## Service Worker

_Koot.js_ 会自动生成 _Service Worker_ 文件并安装。可通过配置调节相应行为，或使用自行编写的 _Service Worker_ 文件。

```javascript
// Koot.js App 配置文件
module.exports = {
    /**
     * **默认配置**
     * - 自动生成 Service-Worker 文件
     * - 预先缓存所有 Webpack 入口
     * - 客户端自动安装
     */
    serviceWorker: true,

    // 禁用自动生成 Service-Worker 文件，禁用自动安装
    serviceWorker: false,

    // 详细配置。配置项及其说明详见下表
    serviceWorker: {
        [option]: 'value',
    },
};
```

**`serviceWorker` 选项**

| 项名           | 值类型                   | 默认值                                        | 解释                                                                                                                                                                                                                                        |
| -------------- | ------------------------ | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `auto`         | `boolean`                | `true`                                        | 是否自动安装生成的 _Service Worker_<br><br>⚠️ 只能自动安装由 _Koot.js_ 生成的 _Service Worker_ 文件                                                                                                                                         |
| `filename`     | `string`                 | `service-worker.js`                           | 生成的 _Service Worker_ 文件的文件名<br><br>启用多语言且为`分别打包`模式（默认模式）时，生成的文件的文件名会在扩展名前插入`.[语言 ID]`，如：`service-worker.zh.js`                                                                          |
| `scope`        | `string`                 | SSR: `/`<br>SPA: `空`                         | `auto = true` 时，自动注册 _Service Worker_ 的作用域                                                                                                                                                                                        |
| `swSrc`        | `string`                 | _undefined_                                   | 自行制定 _Service Worker_ 模板文件。详见下文                                                                                                                                                                                                |
| `include`      | `RegExp[]`<br>`string[]` | `[/\.js$/, /extract\.all\..+?\.large\.css$/]` | 添加额外的预先缓存（Pre-Cache）请求<br><br>预先缓存会默认包含所有 _Webpack_ 入口对应的 _JavaScript_ 文件                                                                                                                                    |
| `exclude`      | `RegExp[]`<br>`string[]` | `[/\.map$/, /^manifest.*\.js$/]`              | 自动生成预先缓存（Pre-Cache）列表时，排除这些项目                                                                                                                                                                                           |
| `cacheFirst`   | `string[]`               | `[]`                                          | 扩展“本地缓存优先”请求策略的地址<br><br>详情见下文<a href="#/pwa?id=扩展缓存规则">扩展缓存规则</a>                                                                                                                                          |
| `networkFirst` | `string[]`               | `[]`                                          | 扩展“网络请求优先”请求策略的地址<br><br>详情见下文<a href="#/pwa?id=扩展缓存规则">扩展缓存规则</a>                                                                                                                                          |
| `networkOnly`  | `string[]`               | `[]`                                          | 扩展“仅通过网络”请求策略的地址<br><br>详情见下文<a href="#/pwa?id=扩展缓存规则">扩展缓存规则</a>                                                                                                                                            |
| 其他选项       |                          |                                               | 其他所有选项会直接传入 `workbox-webpack-plugin` 提供的 `InjectManifest` 插件。<br><br>详细配置文档请参阅[官方文档](https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-webpack-plugin.InjectManifest.html) |

### 模板文件

_Koot.js_ 采用 `workbox-webpack-plugin` 提供的 `InjectManifest` 插件生成 _Service Worker_ 文件。该插件会将 _Workbox_ 引用代码和预先缓存列表注入到指定的模板文件中，后输出到 _Webpack_ 结果目录。

如需自行指定模板文件，请遵循以下规则：

-   针对 _Workbox_ 进行开发 ([Workbox 官方网站](https://developers.google.com/web/tools/workbox))
-   自动注入的变量
    -   `self.__precacheManifest` - 预先缓存列表
    -   `self.__koot.distClientAssetsDirName` - 客户端打包结果中静态资源存放路径的目录名 (默认: `includes`)
    -   `self.__koot.env.WEBPACK_BUILD_ENV` - 当前环境 (`prod` 或 `dev`)

参考: [Koot.js 的默认模板文件](https://github.com/cmux/koot/blob/master/packages/koot-webpack/libs/new-plugin-workbox.js)

### 默认缓存规则

客户端打包中的所有 _JavaScript_ 和 _CSS_ 结果文件均会被初始缓存。首页 (`pathname === '/'`) 也会被初始缓存。

⚠️ 针对多语言项目，仅会对属于该语言的文件进行初始缓存。

| 路由/请求          | 缓存策略     |                                                   |
| ------------------ | ------------ | ------------------------------------------------- |
| `/includes/`       | 本地缓存优先 | 可通过配置项 `distClientAssetsDirName` 设置改路由 |
| `/favicon.ico`     | 本地缓存优先 | 　                                                |
| `/api/`            | 仅通过网络   | 　                                                |
| _不满足任何条件时_ | 网络请求优先 | 　                                                |

### 扩展缓存规则

可通过 `cacheFirst` `networkFirst` `networkOnly` 选项扩展缓存策略。

选项需传入 `string[]`，数组的每一个元素为路由地址。

如果字符串最后一个字符为 `/`，则表示该条路由为路径。

示例:

```javascript
// Koot.js App 配置文件
module.exports = {
    serviceWorker: {
        cacheFirst: ['/assets/', '/logo-large.png'],
    },
};

// http://app.com/assets/6af312a6eff0831aa57944930ac79f79.png
// -> 本地缓存优先

// http://app.com/logo-large.png
// -> 本地缓存优先
```

---

## PWA (Progressive Web App)

_编写中..._
