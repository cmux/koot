# Webpack

---

### 配置对象自动处理

_Koot.js_ 会对传入的 _Webpack_ 配置对象进行全方位的深度包装。以下是对客户端环境的处理内容。

**entry**

-   _Koot.js_ 会自动添加自动添加 2 个入口 (Entry)

    1.  `__KOOT__CLIENT__RUN__FIRST__`<br>在 `<head>` 标签内通过内联 (inline) 方式注入，保证在所有其他 JavaScript 代码执行之前，这个入口的代码会优先执行。
    2.  `client`<br>所有客户端逻辑的主入口，包括 _React_ 渲染/脱水等流程

-   ⚠️ 这些入口不可修改
    <br>⚠️ 在 SSR 服务器渲染/生成的 SPA 模板中，会自动添加加载逻辑

**output**

-   `output.filename` 和 `output.chunkFilename` 存在默认值，支持自行修改。
-   `output.path` 存在默认值，可自行修改但**不建议**直接操作。
    -   可通过调整项目配置 `distClientAssetsDirName` 调整静态资源存放目录，请参阅 [项目配置/distclientassetsdirname](/config?id=distclientassetsdirname)。
    -   如果有修改需要 (如文件直接上传至 _CDN_)，请注意以下事项
        -   配置项 `distClientAssetsDirName` 的值会自动添加到 `output.filename` 和 `output.chunkFilename` 之前，如：
            -   `output.filename = distClientAssetsDirName + '/entry.[chunkhash].js'`
        -   如果不希望该行为，可将配置项 `distClientAssetsDirName` 设为空字符串
-   `output.publicPath` 仅支持在**生产**环境下的修改，开发环境下无视

**module (loader)**

-   以下扩展名的文件的 _Loader_ 已默认添加，不支持在 Webpack 配置中直接调整:
    -   `.js` `.ts`
    -   `.jsx` `.tsx`
    -   `.css` `.less` `.scss` `.sass`。
-   可通过调整项目配置 `internalLoaderOptions` 来对内置的 _Loader_ 进行配置，请参阅 [项目配置/internalLoaderOptions](/config?id=internalLoaderOptions)。

**optimization**

-   _Koot.js_ 为生产环境默认提供了一套代码拆分逻辑方案。若在 _Webpack_ 配置中提供了 `optimization`，则会覆盖默认提供的方案。默认方案：
    -   _React_ 相关的库拆分到 `libs.js`
    -   _Ant-Design_ 相关的库拆分到 `libs-ant-design-related.js`
    -   其他所有引用 2 次及以上的库拆分到 `libs-others.js`

**resolve**

-   项目配置 `aliases` 会默认扩展到 `resolve.alias` 配置中。
-   `resolve.extensions` 配置会默认存在和 JS、TS、CSS 相关的扩展名
-   ⚠️ 服务器端的 _Webpack_ 配置为全自动生成，不可调整。

---

### 相关配置项

请参阅 [项目配置/打包 & webpack](/config?id=%e6%89%93%e5%8c%85-amp-webpack)

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
    webpackBefore: async (kootConfigWithExtra) => ({
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
    webpackAfter: async (kootConfigWithExtra) => ({
        // `kootConfigWithExtra` 中的额外信息详见上文 `webpackBefore` 的说明
    }),
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
                'base-font-size': '40px',
            },
        },
    },
};
```

---

### 打包结果文件对照表

在打包结束后，打包结果目录中会自动生成名为 `.koot-public-manifest.json` 的文件，其中记录着本次打包的 _Webpack_ 入口和最终文件的对照表

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
