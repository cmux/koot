## 0.8.0
**2019-01-25** (beta.1)
- **重大改动**
  - 已放弃兼容 0.6 版本之前的项目配置模式
  - 重写 React 同构服务器逻辑，原则上对已有项目不会造成影响
    - 现在可以放心的从 `koot` 中引用 `store` `history` 和 `localeId` 了
  - 移除了 `sp-css-import` 依赖包，请修改为新式的 `@extend()` 写法
  - 移除了 `pageinfo()` 高阶组件，请修改为新式的 `@extend()` 写法
  - 调整了项目配置方案，原则上对已有项目不会造成影响
    - 0.6版本之前的配置文件现已不再支持
  - 调整 CSS 打包、使用规则
    - 现在明确只存在 2 种 CSS 文件：全局 CSS 和组件 CSS
    - 可通过配置文件对文件名规则进行配置。详情请参见文档的 [配置/客户端](https://koot.js.org/#/config?id=webpack-amp-打包)
    - 全局 CSS 规则
      - 所有全局 CSS 文件会根据所属的 Webpack 入口，被抽出为对应的独立的 CSS 文件 (打包结果中的 `extract.[hash].css`)
      - 所有这些 CSS 文件结果也会被整合到一个统一的 CSS 文件中 (打包结果中的 `extract.all.[hash].css`)
      - 统一的 CSS 文件的文件内容会被自动写入到 `<head>` 标签内的 `<style>` 标签中
      - 虽然通常情况下已无需要，不过根据 Webpack 入口抽出的 CSS 文件仍可根据具体的需求独立使用
    - 组件 CSS 规则
      - 所有的组件 CSS 必须通过 `extend` 高阶组件的 `styles` 选项调用
      - 这些 CSS 文件必须有一个名为 `.component` 或 `.[name]__component` 的 className
        - 该 className 会被更换为 hash 结果，如 `.a85c6k` 或 `.nav__bjj15a`
      - `props.className` 会传入到对应的组件，其值为与上述结果对应的 hash 后的 className
- 核心
  - 配置项
    - **新** `historyType` - 项目所用的 `history` 组件的类型。详情请参见文档的 [配置](https://koot.js.org/#/config?id=historytype) 章节
    - **新** `internalLoaderOptions` - 用以扩展几乎无法修改的内置 `loader` 所用的设置。详情请参见文档的 [配置](https://koot.js.org/#/config?id=internalloaderoptions) 章节
    - **新** `serverOnRender.beforeDataToStore` 和 `serverOnRender.afterDataToStore` - 允许更详细的使用服务器端渲染生命周期。详情请参见文档的 [配置](https://koot.js.org/#/config?id=Webpack) 章节
    - `cookiesToStore` 现支持传入 `true`: 同步所有 cookie，包括 cookie 原始字符串 (以 `__` 为名称)
  - 优化 `koot-start` 命令，尽量避免 `koot-build 命令未找到` 的问题
  - Webpack 打包
    - 现在打包时不再会在项目根目录下生成临时文件
      - 这些文件现在移至 `/logs/tmp/` 目录下
    - 现在每种打包模式仅保留最近 2 次打包的日志文件 (`/logs/webpack-config/` 目录下)
  - 开发环境
    - 优化 React 组件热更新能力
    - 将大部分开发环境所用的临时文件和标记文件整合、移动到 `/logs/dev` 目录中
- React
  - 根层组件添加 `componentDidCatch` 生命周期方法，以保障 React 输出渲染结果
- React SPA
  - 对于传入自定 `store` 对象或生成方法的项目，确保生成 `store` 使用的 `history` 对象为浏览器所用对象
  - 移除 `AppContainer` 逻辑的相关文件
- 添加依赖包
  - `extract-hoc`
- 移除依赖包
  - `autoprefixer`
  - `koa-compose`
  - `koa-compress`
  - `koa-helmet`
  - `koa-html-minifier`
  - `koa-json`
  - `koa-multer`
  - `koa-onerror`
  - `koa-response-time`
  - `progress`
  - `sp-css-import`
- 更新依赖包
  - major
    - `copy-webpack-plugin` -> _5.0.0_
    - `css-loader` -> _2.1.0_
    - `file-loader` -> _3.0.1_
    - `koa-body` -> _4.0.8_
    - `koa-mount` -> _4.0.0_
    - `koa-static` -> _5.0.0_
    - `yargs` -> _13.2.1_
  - minor
    - `@babel/core` -> _7.3.3_
    - `@babel/plugin-proposal-class-properties` -> _7.3.3_
    - `@babel/plugin-proposal-decorators` -> _7.3.0_
    - `@babel/plugin-proposal-object-rest-spread` -> _7.3.2_
    - `@babel/plugin-syntax-dynamic-import` -> _7.2.0_
    - `@babel/plugin-transform-runtime` -> _7.2.0_
    - `@babel/polyfill` -> _7.2.5_
    - `@babel/preset-env` -> _7.3.1_
    - `acorn` -> _6.1.0_
    - `autoprefixer` -> _9.4.7_
    - `koa` -> _2.7.0_
    - `less` -> _3.9.0_
    - `mini-css-extract-plugin` -> _0.5.0_
    - `pm2` -> _3.3.1_
    - `ora` -> _3.1.0_
    - `os-locale` -> _3.1.0_
    - `react` -> _16.8.3_
    - `react-dom` -> _16.8.3_
    - `react-hot-loader` -> _4.7.1_
    - `webpack` -> _4.29.5_
    - `webpack-dev-middleware` -> _3.6.0_
    - `webpack-dev-server` -> _3.2.0_
  - patch
    - `babel-loader` -> _8.0.5_
    - `chalk` -> _2.4.2_
    - `debug` -> _4.1.1_
    - `inquirer` -> _6.2.2_
    - `portfinder` -> _1.0.20_
    - `postcss` -> _7.0.14_
    - `rimraf` -> _2.6.3_
    - `webpack-bundle-analyzer` -> _3.0.4_

## 0.7.13
**2018-02-22**
- React同构 (`ReactApp`)
  - 进一步对客户端运行脚本进行优化，以减少初始渲染时闪屏出现几率

## 0.7.12
**2018-12-24**
- React
  - 高阶组件 `extend()`
    - 确保 `pageinfo` 方法会被执行

## 0.7.11
**2018-12-17**
- 核心
  - 多语言
    - 同构时如果获取的语种ID在项目中不存在，现在会忽略该值

## 0.7.10
**2018-12-12**
- 核心
  - 配置项
    - 现在会处理 `server.onRender.beforeDataToStore` 或 `server.onRender.afterDataToStore` 配置为 `Pathname` 类型的情况

## 0.7.9
**2018-12-12**
- 核心
  - 配置项
    - **新** `server.onRender.beforeDataToStore` 和 `server.onRender.afterDataToStore` - 允许对服务器渲染时的生命周期方法进行更详细的设定。详情请参见文档的 [配置/服务器端](https://koot.js.org/#/config?id=服务器端) 章节

## 0.7.8
**2018-12-11**
- 错误修正
  - 修复客户端无法保存当前语种ID的问题

## 0.7.7
**2018-12-11**
- 核心
  - 配置项
    - **新** `i18n.use` - 配置多语言项目的 URL 使用方式。详情请参见文档的 [配置/多语言](https://koot.js.org/#/config?id=多语言) 章节
  - 多语言
    - 现支持第一级路由为语种ID的使用方案 (`i18n.use = 'router'`)
    - 自动添加的多语言跳转 meta 标签现在会过滤掉当前语言的标签
- React同构 (`ReactApp`)
  - 改进服务器输出 CSS 结果时的稳定性
- 更新依赖包
  - patch
    - `react-router` -> _3.2.1_

## 0.7.6
**2018-12-04**
- 核心
  - 配置项
    - **新** `server.proxyRequestOrigin` - 若本 Node.js 服务器是通过其他代理服务器请求的（如 nginx 反向代理），可用这个配置对象声明原请求的信息。详情请参见文档的 [配置](https://koot.js.org/#/config) 章节
  - PWA
    - `service-worker` 默认行为调整，现在初始时仅会对 `.js` 文件进行缓存
- 错误修正
  - 修复某些情况下，同构服务器启动端口不正确的问题

## 0.7.5
**2018-12-03**
- React
  - 高阶组件 `extend()`
    - `connect` 现在支持传入 Array，以对应 `react-redux` 的 `connect()` 的多参数情形
- React同构 (`ReactApp`)
  - 确保服务器的 `onRender` 生命周期仅响应可用的请求，同时确保此时的数据为最新可用的数据
- 错误修正
  - 修复某些情况下，模板注入 (`inject`) 使用的 `state` 失效的问题
  - 修复某些情况下，Webpack 打包因出错挂起的问题

## 0.7.4
**2018-11-29**
- 核心
  - Webpack 打包
    - 现在每种打包模式仅保留最近 5 次打包的日志文件 (`/logs/webpack-config/` 目录下)
- React同构 (`ReactApp`)
  - 注入 (`inject`) 现在支持函数写法，详情请参见文档的 [HTML 模板](https://koot.js.org/#/template) 章节
- React SPA
  - 不启用多语言的项目现在可以恢复使用 SPA 模式了
- 错误修正
  - 修复并发访问时存在多个 `koot-locale-id` meta 标签的问题
  - 修复某些情况下，HTML 同构结果中 `<script>` 标签之间会出现额外逗号 (`,`) 的问题
- 更新依赖包
  - minor
    - `webpack` -> _4.26.1_
  - patch
    - `mini-css-extract-plugin` -> _0.4.5_
    - `terminate` -> _2.1.2_
    - `yargs` -> _12.0.5_

## 0.7.3
**2018-11-22**
- 核心
  - 配置项
    - **新** `webpack.hmr` - 可选。开发模式下 `webpack.HotModuleReplacementPlugin` 插件的配置对象。详情请参见文档的 [配置](https://koot.js.org/#/config) 章节
  - 多语言
    - 翻译方法 (默认 `__()`) 现在支持语言包中类型为 `Array` 的内容
  - 开发模式
    - `react` 自动热更新能力现在支持更多的情况
- React
  - 支持提供 `store` 创建方法函数的项目

## 0.7.0
**2018-11-19**
- 核心
  - 配置项
    - **新** `css` - CSS 打包相关设置。详情请参见文档的 [配置](https://koot.js.org/#/config) 章节
    - **新** `webpack.dll` - 开发模式下供 `webpack.DllPlugin` 使用。webpack 的监控不会处理这些库/library，以期提高开发模式的打包更新速度。详情请参见文档的 [配置](https://koot.js.org/#/config) 章节
    - **新** `redux.syncCookie` - 允许服务器端在同构时将 `cookie` 中对应的项同步到 redux state 的 `server.cookie` 中。详情请参见文档的 [配置](https://koot.js.org/#/config) 章节
  - 生产模式
    - 使用 `koot-start` 命令时，如果打包过程发生错误，现在会显示更详细的错误记录
  - 开发模式
    - 现在可以同时启动多个 Koot 项目的开发模式了
    - 启用 `webpack` 热更新的 `多步骤 (multiStep)` 机制提高热更新速度
    - 启用 `webpack.DllPlugin` 提高打包更新速度
  - 分析模式
    - 输出的文件名结果现在具有可读性
  - Webpack 打包
    - 重写 CSS 相关 `loader`，现在会确保同构结果中 CSS 样式名的正确性
    - 执行打包时会自动清理 `/logs/webpack-config/` 目录下创建于 2 天前的报告文件
    - `/logs/webpack-config/` 目录下新生成的报告文件中，现在会正确的显示正则表达式
- React
  - 高阶组件 `extend()`
    - `pageinfo` 和 `data` 不再要求必须使用 `connect`
    - 使用新的 `context` 语法重写样式、CSS 相关逻辑
- React同构 (`ReactApp`)
  - 现在启动服务器时会对设定的端口进行检查。如果端口被占用，会报告相应的错误
  - 对于传入完整 `store` 的项目，现在每次请求时会尝试使用全新的 `state`
  - 优化服务器端初始化 `store` 的流程
- 错误修正
  - 修复生成了错误的多语言跳转 meta 链接地址的问题
  - 修正某些情况下 React 组件热更新不起作用的问题
- 添加依赖包
  - `inquirer`
  - `is-port-reachable`
  - `portfinder`
- 移除依赖包
  - `sp-css-loader`
- 更新依赖包
  - major
    - `sp-css-import` -> _4.0.0_
  - minor
    - `copy-webpack-plugin` -> _4.6.0_
    - `webpack` -> _4.25.1_
  - patch
    - `@babel/core` -> _7.1.6_
    - `@babel/plugin-proposal-decorators` -> _7.1.6_
    - `@babel/preset-env` -> _7.1.6_
    - `css-loader` -> _1.0.1_
    - `fs-extra` -> _7.0.1_
    - `postcss` -> _7.0.6_
    - `react` -> _16.6.3_
    - `react-dom` -> _16.6.3_
    - `react-hot-loader` -> _4.3.12_
    - `react-redux` -> _5.1.1
    - `sp-css-loader` -> _1.5.3_
    - `yargs` -> _12.0.4_
- 其他
  - 更新测试项目和测试案例
  - `koot-cli`
    - 更新项目到 v0.7 时，会自动添加兼容旧版规则的 `css` 配置
  - `sp-css-import`
    - 更新核心代码，以兼容 koot v0.6 后的新结构
    - 使用新的 `context` 语法重写样式、CSS 相关逻辑

## 0.6.1
**2018-10-29**
- 错误修正
  - 修复打包时将 webpack 配置写入 log 文件的过程中的一处错误

## 0.6.0
**2018-10-29**
- 核心
  - 新的配置方式 `koot.config.js`
    - 整合原有的 `koot.js` 和 `koot.build.js`
    - 原有配置方式依旧可用
    - 请参照模板项目了解新的配置文件内容和写法
  - 项目配置
    - `redux` 新增可选配置项 `store`
      - 项目自创建的 Redux store。提供该对象时，`redux.combineReducers` 配置项会被忽略
  - 开发模式
    - 启用 `babel-loader` 的缓存，加速热更新的响应速度
  - Webpack
    - 写入打包配置记录文件时如果发生错误，现在会忽略该错误，并继续流程
- React
  - 路由 (router) 移除配置外层包裹的空层级
  - 模板 (`ejs`)
    - 新语法
      - `content(文件名)`
<br>输出对应文件的文件内容到 HTML 代码中，如 `content('critical.css')` 会读取打包结果中的 `critical.css` 并渲染到 HTML 代码中
      - `pathname(文件名)`
<br>输出对应文件的访问地址到 HTML 代码中，如 `pathname('critical.css')` 会将打包结果中 `critical.css` 的 URL 访问地址渲染到 HTML 代码中
    - 如果模板文件中针对 `critical` 使用上述新语法，则 `styles` 和 `scripts` 两个注入内容中不会出现 `critical` 的相关内容
    - 模板项目已更新，可供参考
- React 同构
  - 生产 (`prod`) 环境开启渲染缓存，缓存默认存在 **5秒**
- `sp-css-loader`
  - 开发模式下启用CSS样式名可读性规则：CSS样式名以 `.[class]__component` 方式命名时，DOM 上的样式名会变为类似 `.nav__a8c0` 的结果
- 更新依赖包
  - `react` -> _16.6.0_
  - `react-dom` -> _16.6.0_
  - `react-redux` -> _5.1.0_
  - `webpack` -> _4.23.1_
  - `webpack-dev-server` -> _3.1.10_
  - `copy-webpack-plugin` -> _4.5.4_
  - `autoprefixer` -> _9.3.1_

## 0.5.5
**2018-10-15**
- 核心
  - Webpack
    - `less-loader` 默认开启 Javascript 选项 (`javascriptEnabled`)

## 0.5.4
**2018-10-15**
- React
  - 移除根层 `#root` 下的额外 `<div>`

## 0.5.2
**2018-10-12**
- React
  - 高阶组件 `extend`
    - `data` 可传入 _Function_，作为传统的 `data.fetch`
      - 该情况下，数据检查操作建议写在 redux action 中
    - `data.fetch` 可传入 _Array_，核心代码会自动执行 `Promise.all()`

## 0.5.1
**2018-10-11**
- 错误修正
  - `pageinfo` 移除已有 `meta` 标签时遇到 `undefined` 时全局报错的问题

## 0.5.0
**2018-10-11**
- 核心
  - 为避免版本冲突，将所有 NPM 依赖包的版本改为固定版本
- 开发模式 (`koot-dev`)
  - 新的命令选项 `--no-open`：禁用自动打开浏览器
  - 针对 React 组件自动启用热更新
    - 注意事项请参见文档的 [React组件热更新](https://koot.js.org/react-hmr) 章节
- React同构 (`ReactApp`)
  - 新的高阶组件 `extend`
    - `import { extend } from 'koot'`
    - 可作为组件装饰器使用
    - 提供同构数据功能
    - 包含 `pageinfo` 和 `ImportStyle` 功能
    - 具体用法请参见文档的 [React高阶组件](https://koot.js.org/react-hoc) 章节
  - 优化 CSS 处理相关流程
  - 开发模式
    - 页面可访问静态资源文件目录中的内容
- 错误修正
  - 浏览器环境 (`__CLIENT__`) 中使用 `utils/get-port` 方法无结果的问题

## 0.4.3
**2018-09-18**
- **ReactApp** (React同构)
  - 开发模式：重写可使用本机 IP 地址访问的功能，现在会适应更多场景

## 0.4.2
**2018-09-18**
- 打包配置 (`/koot.build.js`)
  - 新增选项：`staticAssets`
    - 静态资源文件存放路径，打包时会自动复制该目录下的所有文件到打包目录下，方便直接使用

## 0.4.1
**2018-09-17**
- `koot-analyze` 命令现在不会生成 `service-worker` 文件
- **ReactApp** (React同构)
  - 开发模式：可使用本机 IP 地址访问

## 0.4.0
**2018-09-17**
- 启用命令: `koot-analyze`

## 0.3.2
**2018-09-14**
- 错误修正
  - 开发模式不会实时响应语言包文件更新的问题

## 0.3.1
**2018-09-14**
- 错误修正
  - 开发模式不断重启的问题

## 0.3.0
**2018-09-14**
- **ReactApp** (React同构)
  - 当多语言（i18n）启用时，在 `<head>` 中自动生成跳转到相应的其他语种的链接的 `<link>` 标签
- 内部代码
  - `hl` 修改为全局常量

## 0.2.4
**2018-09-14**
- 依赖库
  - 添加：`@babel/plugin-syntax-dynamic-import`

## 0.2.3
**2018-09-12**
- 生成 Webpack 配置
  - 完善：忽略值为 `null` `undefined` 等空值的插件项

## 0.2.2
**2018-09-12**
- 生成 Webpack 配置
  - 忽略值为 `null` `undefined` 等空值的插件项

## 0.2.1
**2018-09-11**
- 错误修正
  - 启动开发模式时生成名为 `1.json` 文件的问题

## 0.2.0
**2018-09-10**
- 更新 `babel` 至 v7
- 新增单元测试
  1. 生成 Webpack 配置
  2. Webpack 打包流程

## 0.1.0
**2018-08-24**
- 更名至 `koot`
- 重置版本号

----

更名至 `koot`

----

## 3.0.7-alpha.31
**2018-06-19**
- 可直接通过 `super-project` 载入内容
  - 用法示例：`import { store, history } from 'super-project'`)
  - 当前可用内容
    - `store` - Redux store
    - `history` - 路由与历史记录对象，包含 `push`、`replace` 等方法
    - `localeId` - (仅在 i18n 开启时可用) 当前语种ID
    - `pageinfo` - (原 `super-ui-page`) 更新页面 `title` 和 `meta` 的装饰器
- 移除 `super-ui-page` 依赖
  - 原有的 `superPage` 移动到 `super-project` 主包中
  - 更名为 `pageinfo`

## 2.4.0
2018-02-11
  - 新增文件 `CHANGELOG.md`
  - 更新依赖库
  - `sp-isomorphic-utils`
    - `getFile`: 如果根据文件名直接匹配到目标文件，直接返回该文件名，不再继续进行文件夹内过滤
  - `sp-pwa`
    - `create`: 创建 service-worker 时，新增参数 `outputFilenameHash`，表示创建的 sw 文件名中带有 hash，默认为 `false`
      - 当前的 service-worker 规范中，浏览器不会对 sw 文件进行缓存，每次访问页面时都会尝试重新获取 sw 文件
    - `get-service-worker-file`: 更新到最新的 `getFile()` 方法
