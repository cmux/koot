# Webpack

---

### 配置对象自动处理

_Koot.js_ 会对传入的 _Webpack_ 配置对象进行全方位的深度包装。以下是对客户端环境的处理内容。

**entry**

自动添加 2 个入口

-   `__KOOT__CLIENT__RUN__FIRST__`<br>在 `<head>` 标签内通过内联 (inline) 方式注入，保证在所有其他 JavaScript 代码执行之前，这个入口的代码会优先执行。
-   `client`<br>所有客户端逻辑的主入口，包括 _React_ 渲染/脱水等流程
-   ⚠️ 这些入口不可修改，同时会在服务器渲染/生成的 SPA 模板中，自动添加加载逻辑

**output**

`filename` 和 `chunkFilename` 存在默认值，同时支持自行修改。

`path` 和 `publicPath` 存在默认值，可自行修改但不建议直接操作。

可通过调整项目配置 `distClientAssetsDirName` 调整静态资源存放目录。

如果有修改需要 (如文件直接上传至 _CDN_)，请注意以下事项

-   配置项 `distClientAssetsDirName` 的值会自动添加到 `output.filename` 和 `output.chunkFilename` 之前，如：
    -   `output.filename = distClientAssetsDirName + '/entry.[chunkhash].js'`
    -   如果不希望该行为，可将配置项 `distClientAssetsDirName` 设为空字符串
-   `output.publicPath` 仅支持在**生产**环境下的修改

**module (loader)**

以下扩展名的文件的 _Loader_ 以默认添加，且不支持修改调整: `js` `ts` `jsx` `tsx` `css` `less` `scss` `sass`。

可通过调整项目配置 `internalLoaderOptions` 来对内置的 _Loader_ 进行配置。

**optimization**

生产环境下，默认支持一套代码拆分逻辑。该选项可自行覆盖。默认逻辑：

-   _React_ 相关的库拆分到 `libs.js`
-   _Ant-Design_ 相关的库拆分到 `libs-ant-design-related.js`
-   其他所有引用 2 次及以上的库拆分到 `libs-others.js`

**resolve**

项目配置 `aliases` 会默认扩展到 `resolve.alias` 配置中。

`resolve.extensions` 配置会默认存在和 JS、TS、CSS 相关的扩展名

⚠️ 服务器端的 _Webpack_ 配置为全自动生成，不可调整。

---

### 相关配置项

| 项名                      | 值类型                 | 默认值                                             | 解释                                                                                                                                                                                                                                                                                                                                                 |
| ------------------------- | ---------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `webpackConfig`           | `Object` 或 `Function` | _无_                                               |                                                                                                                                                                                                                                                                                                                                                      |
| `distClientAssetsDirName` | `string`               | `includes`                                         | 客户端打包结果中静态资源存放路径的目录名。                                                                                                                                                                                                                                                                                                           |
| `webpackBefore`           | `Function`             | _无_                                               | Webpack 打包执行之前执行的方法。注意事项详见下文。                                                                                                                                                                                                                                                                                                   |
| `webpackAfter`            | `Function`             | _无_                                               | Webpack 打包执行之后执行的方法。注意事项详见下文。                                                                                                                                                                                                                                                                                                   |
| `moduleCssFilenameTest`   | `RegExp`               | <code>/\.(component&#124;view&#124;module)/</code> | 组件 CSS 文件名检查规则，不包括扩展名部分。有关 CSS 的使用请查阅 [CSS](/css)。<br><br>_默认值解释:_ 文件名以 `.component.css` `.view.css` 或 `.module.css` (扩展名可为 `css` `less` `sass`) 为结尾的文件会当作组件 CSS，其他文件会被当做全局 CSS。<br><br>_注:_ _TypeScript_ 项目中，如果修改了该配置，针对组件 CSS 对象的默认的 TS 定义声明会失效。 |
| `internalLoaderOptions`   | `Object`               | _无_                                               | 用以扩展几乎无法修改的内置 Webpack loader 的配置。示例见下文。                                                                                                                                                                                                                                                                                       |
| `classNameHashLength`     | `number`               | `6`                                                | 调整组件 CSS 的 className hash 长度。                                                                                                                                                                                                                                                                                                                |
| `bundleVersionsKeep`      | `number` 或 `boolean`  | `2`                                                | 保留最近 `N` 次的客户端打包结果文件。如果为自然数，表示开启该功能，其他值均表示关闭该功能。                                                                                                                                                                                                                                                          |

**关于 `webpackBefore` 和 `webpackAfter`**

```javascript
module.exports = {
    // 默认值
    webpackBefore: undefined,
    webpackAfter: undefined,

    /**
     * @async
     * @param {Object} kootConfigWithExtra koot 完整配置对象，附加额外信息
     * @void
     */
    webpackBefore: async kootConfigWithExtra => ({
        /*
         * `kootConfigWithExtra` 对象中的额外信息
         * - `__WEBPACK_OUTPUT_PATH` - 本次打包的目标目录
         * - `__CLIENT_ROOT_PATH` - 仅针对客户端，本次打包结果的客户端根目录
         */
    }),
    /**
     * @async
     * @param {Object} kootConfigWithExtra koot 完整配置对象，附加额外信息
     * @void
     */
    webpackAfter: async kootConfigWithExtra => ({
        // `kootConfigWithExtra` 中的额外信息详见上文 `webpackBefore` 的说明
    })
};
```

**`internalLoaderOptions` 示例**

```javascript
module.exports = {
    // 默认值
    internalLoaderOptions: undefined,

    // 示例: 扩展 `less-loader` 的配置
    internalLoaderOptions: {
        'less-loader': {
            modifyVars: {
                'base-font-size': '40px'
            }
        }
    }
};
```

---

### Chunkmap (Chunk 对照表)

在打包结束后，打包结果目录中会自动生成名为 `.public-chunkmap.json` 的文件，其中记录着本次打包的 Webpack 入口和最终文件的对照表

**对照表结构**

```json
{
    ".entrypoints": {
        "client": ["FILE #1 PATHNAME", "FILE #2 PATHNAME"],
        "ENTRY#2": ["FILE #1 PATHNAME"]
    },
    ".files": {
        "client.js": "PATHNAME",
        "client.css": "PATHNAME - 从以 client 为入口的 js 文件中抽取的 CSS 文件",
        "CHUNK#1.js": "PATHNAME - chunk #1 的 js 文件打包结果"
    },
    "CHUNK#1": ["PATHNAME - chunk #1 的 js 文件打包结果"],
    "client": [
        "FILE #1 PATHNAME",
        "FILE #2 PATHNAME",
        "PATHNAME - 从以 client 为入口的 js 文件中抽取的 CSS 文件"
    ]
}
```

**多语言分包项目的对照表结构**

```json
{
    ".en": {
        "对应语言 en": "的对照表结构"
    },
    ".zh": {
        "对应语言 zh": "的对照表结构"
    }
}
```

**文件地址规则**

对照表中的文件地址 (pathname) 均为相对于打包结果目录 (默认为 `./dist`) 的相对路径

**命名规则**

-   特殊项目的 key 值均以 `.` 开头，如 `.entrypoints` `.files`
