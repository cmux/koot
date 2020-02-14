# 全局与工具函数

_Koot.js_ 提供许多全局函数与工具函数，项目代码中可随意调用这些函数并使用。

> 项目代码指所有经过 _Webpack_ 处理的 _JavaScript_ 文件的代码。通常来说，除了 _Koot.js_ 项目配置文件 (`koot.config.js`)、_Babel_ 配置文件 (`babel.config.js`) 等配置文件外，其他所有的代码文件都会经过 _Webpack_ 处理。

---

### 全局函数

所有的全局函数都均引用自 `koot`，如：

```javascript
import { extend, getLocaleId } from 'koot';
```

目前提供以下全局函数

##### 通用

##### `extend(options: extendOptions): React.ComponentClass`

React 高阶组件。用途与用法详见 [React/高阶组件](/react?id=高阶组件-extend)

##### `getStore(): Store`

获取当前的 _Redux store_。有关在 _Koot.js_ 中使用 Redux 和 store 存储空间，详见 [Store](/store)

##### `getHistory(): History`

获取当前的 _History_ 对象

##### `getLocaleId(): LocaleId`

获取当前匹配的语种 ID。有关释义和在 _Koot.js_ 中开发多语言，详见 [多语言](/i18n)

##### `getCache(localeId?: LocaleId | boolean): Object`

获取公用缓存空间

-   参数
    -   如果为 `true`，返回对应当前语种的独立对象
    -   如果为 string，返回对应语种的独立对象
    -   如果不提供参数（默认情况），返回公用对象
-   返回的对象
    -   _客户端_: 返回 `window` 上的一个对象
    -   _服务器端_: 在 session 间共享的对象，服务器启动时创建
-   注
    -   客户端与服务器端的结果不同，在编写同构逻辑时请注意
    -   公用对象空间内不包含对应语种的对象，需要对应语种的结果时需要提供 `localeId`

##### `createStore(appReducer?: Reducer | ReducersMapObject, appMiddlewares?: Array<Middleware>, appEnhancers?: Array<StoreEnhancer>): Store`

创建 _Redux store_。用途与用法详见 [Store/全局函数 createStore](/store?id=全局函数-createstore)

##### 仅服务器端

##### `getCtx(): Koa | undefined`

获取 _Koa ctx_ 对象

---

### 工具函数

工具函数均引用自 _Koot_ 目录下的独立文件，如：

```javascript
import getClientFilePath from 'koot/utils/get-client-file-path';
```

目前提供以下全局函数

##### 客户端 & 服务器端

##### `getPort(): number`

-   引用地址: `koot/utils/get-port`
-   获取 _Web 服务器_ 的端口号

##### 仅客户端

##### `clientUpdatePageinfo(title?: string, metas?: Array<MetaObject>): void`

-   引用地址: `koot/utils/client-update-pageinfo`
-   更新页面标题 `<title>` 和 `<meta>` 标签

##### `clientGetStyles(): {_global: R, [moduleId]: R}`

-   引用地址: `koot/utils/client-get-styles`
-   获取当前全局 CSS 和所有组件 CSS
-   返回值中的 `R` 为对象，包含属性:
    -   _string_ `text` CSS 字符串值
    -   _CSSRuleList_ `rules`

##### 仅服务器端

##### `getClientFilePath(filename: string): string | string[]`

-   引用地址: `koot/utils/get-client-file-path`
-   获指定文件在客户端中的可访问路径，其结果可直接用于浏览器中的资源请求
-   返回的结果可能是数组

##### `readClientFile(filename: string): string`

-   引用地址: `koot/utils/read-client-file`
-   读取目标文件的内容
-   该文件必须为客户端打包结果

##### 仅打包

##### `webpackOptimizationProd(): WebpackConfigOptimization`

-   引用地址: `koot/utils/webpack-optimization-prod`
-   生成 Webpack `optimization` 配置，用于拆分代码
