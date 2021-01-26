/**
 * _Koot.js_ 项目配置对象
 * @typedef {Object} AppConfig
 *
 * @property {string} [name] 项目名称
 *      - 默认值: `package.json` 中的 `name` 属性
 *      - 以下场景会使用该名称值作为默认值
 *          -- SSR: 若首页组件没有通过 `extend()` 设定标题，默认使用该名作为页面标题。
 *          -- SPA: 模板中的 `<%= inject.title %>` 默认使用该名进行注入替换。
 * @property {string} dist 打包结果存放路径
 *      - _仅针对_ **生产环境**
 *
 * @property {Function|Object} webpackConfig Webpack 配置方法函数或完整的配置对象
 *
 * @property {AppConfigBeforeBuild} [beforeBuild] 🚩生命周期🚩 在打包流程即将开始之前触发
 * @property {AppConfigAfterBuild} [afterBuild] 🚩生命周期🚩 在打包流程结束之后立刻触发
 *      - **注**: 开发环境热更新时不会触发 `afterBuild` 生命周期
 *
 */

// ============================================================================

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
