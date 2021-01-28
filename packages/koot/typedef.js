/**
 * _Koot.js_ 项目配置对象
 * @typedef {Object} AppConfig
 *
 *
 *
 * @property {string} [name] 项目名称
 *      - 默认值: `package.json` 中的 `name` 属性
 *      - 以下场景会使用该名称值作为默认值
 *          -- SSR: 若首页组件没有通过 `extend()` 设定标题，默认使用该名作为页面标题。
 *          -- SPA: 模板中的 `<%= inject.title %>` 默认使用该名进行注入替换。
 * @property {'react'|'react-spa'} [type] 项目类型。不同类型的打包结果文件结构会有差异
 *      - _默认_ `react` React SSR/同构项目
 *      - `react-spa` React SPA/单页应用
 * @property {'serverless'|'electron'} [target] 项目子类型
 *      - _默认_ `serverless`
 *          -- **_仅针对_** `type = 'react'`
 *          -- 生成 Serverless 模式的服务器启动脚本
 *      - `electron` React SPA/单页应用
 *          -- **_仅针对_** `type = 'react-spa'`
 *          -- 额外生成 Electron 结果目录，其内包含 Electron 可执行版本
 * @property {Pathname} [dist] 打包结果存放路径
 *      - **_仅针对_** `生产环境`
 *      - _默认_ `./dist`
 * @property {FilePathname} template HTML 模板文件路径
 *      - 目前仅支持 `.ejs`
 *      - 有关模板的使用请查阅 [HTML 模板](https://koot.js.org/#/template)
 * @property {FilePathname} [templateInject] 自定义 HTML 模板替换函数的文件路径
 *      - 支持 `.js` `.ts`
 *      - 文件需输出 `Object`
 *      - 请查阅 [HTML 模板](https://koot.js.org/#/template)。
 * @property {false|Array<KootI18nSingleLanguage>|KootI18nConfigurationObject} [i18n] 多语言配置
 *      - _默认_ `false` (不启用)
 *      - 关于详细配置、多语言的使用、语言包规则等内容，请查阅 [多语言 (i18n)](https://koot.js.org/#/i18n)
 *
 *
 *
 * @property {FilePathname} routes 路由配置对象文件路径
 *      - 支持 `.js` `.ts`
 *      - 文件需输出 `Object`
 *      - 供 `react-router` 使用。_Koot.js_ 目前使用的 `react-router` 版本为 **v3**
 *      - 有关路由配置的编写请查阅 [react-router v3 官方文档/Route Configuration](https://github.com/ReactTraining/react-router/blob/v3/docs/guides/RouteConfiguration.md)
 * @property {'browser'|'hash'} [historyType] 客户端历史记录 (`history` 模块) 的类型
 *      - **_仅针对_** `客户端`
 *      - 可省略 `History` 字段，如 `browserHistory` 和 `browser` 等效
 *      - _默认_ `browser` (SSR) / `hash` (SPA)
 *
 *
 *
 * @property {Object|function():Object} webpackConfig Webpack 配置方法函数或完整的配置对象
 * @property {AppConfigBeforeBuild} [beforeBuild] 🚩生命周期🚩 在打包流程即将开始之前触发
 * @property {AppConfigAfterBuild} [afterBuild] 🚩生命周期🚩 在打包流程结束之后立刻触发
 *      - **注**: 开发环境热更新时不会触发 `afterBuild` 生命周期
 *
 */

// ============================================================================

/**
 * 目录的路径名，支持绝对路径和相对路径，相对路径必须以 `.` 开头。
 * @typedef {string} Pathname
 */
/**
 * 文件的路径名，支持绝对路径和相对路径，相对路径必须以 `.` 开头。
 * @typedef {string} FilePathname
 */
/**
 * 语种 ID
 * @typedef {string} LocaleId
 */
/**
 * _Koot.js_ 多语言配置 - 完整配置对象
 * @typedef {Object} KootI18nConfigurationObject
 * @property {'default'|'store'} type
 * @property {'query'|'router'} use
 * @property {string} [expr="__"]
 * @property {string} [domain]
 * @property {string} [cookieKey="spLocaleId"]
 * @property {Array<KootI18nSingleLanguage>} [locales]
 */
/**
 * _Koot.js_ 多语言配置 - 单条语种语言包配置
 * @typedef {[LocaleId, FilePathname]} KootI18nSingleLanguage
 */

/**
 * `beforeBuild`
 * @async
 * @callback AppConfigBeforeBuild
 * @param {AppConfig} appConfig _Koot.js_ 项目配置对象
 * @returns {void | Promise<void>}
 */
/**
 * `afterBuild`
 * @async
 * @callback AppConfigAfterBuild
 * @param {AppConfig} appConfig _Koot.js_ 项目配置对象
 * @returns {void | Promise<void>}
 */
