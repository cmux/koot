# Service-Worker & PWA

---

### Service Worker

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
        [option]: 'value'
    }
};
```

**`serviceWorker` 选项**

| 项名       | 值类型                   | 默认值                                        | 解释                                                                                                                                                               |
| ---------- | ------------------------ | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `auto`     | `boolean`                | `true`                                        | 是否自动安装生成的 _Service Worker_<br><br>注: 只能自动安装由 _Koot.js_ 生成的 _Service Worker_ 文件                                                               |
| `filename` | `string`                 | `service-worker.js`                           | 生成的 _Service Worker_ 文件的文件名<br><br>启用多语言且为`分别打包`模式（默认模式）时，生成的文件的文件名会在扩展名前插入`.[语言 ID]`，如：`service-worker.zh.js` |
| `swSrc`    | `string`                 | _undefined_                                   | 自行制定 _Service Worker_ 模板文件。详见下文                                                                                                                       |
| `include`  | `RegExp[]`<br>`string[]` | `[/\.js$/, /extract\.all\..+?\.large\.css$/]` | 添加额外的预先缓存（Pre-Cache）请求<br><br>预先缓存会默认包含所有 _Webpack_ 入口对应的 _JavaScript_ 文件                                                           |
| `exclude`  | `RegExp[]`<br>`string[]` | `[/\.map$/, /^manifest.*\.js$/]`              | 自动生成预先缓存（Pre-Cache）列表时，排除这些项目                                                                                                                  |

**模板文件**

_Koot.js_ 采用 `workbox-webpack-plugin` 提供的 `InjectManifest` 插件生成 _Service Worker_ 文件。该插件会将 _Workbox_ 引用代码和预先缓存列表注入到指定的模板文件中，后输出到 _Webpack_ 结果目录。

如需自行指定模板文件，请遵循以下规则：

-   针对 _Workbox_ 进行开发 ([Workbox 官方网站](https://developers.google.com/web/tools/workbox))
-   自动注入的变量
    -   `self.__precacheManifest` - 预先缓存列表
    -   `self.__koot.distClientAssetsDirName` - 客户端打包结果中静态资源存放路径的目录名 (默认: `includes`)
    -   `self.__koot.env.WEBPACK_BUILD_ENV` - 当前环境 (`prod` 或 `dev`)

参考: [Koot.js 的默认模板文件](https://github.com/cmux/koot/blob/master/packages/koot-webpack/libs/new-plugin-workbox.js)

---

### PWA (Progressive Web App)

_编写中..._
