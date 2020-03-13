/**
 * @typedef {Object} AppInfo
 * @property {string} cwd 当前运行目录
 * @property {string} name 项目名
 * @property {string} [description] 项目描述
 * @property {AppType} type 项目类型
 * @property {BoilerplateType} boilerplate 摸板类型
 * @property {string|AuthorObject} [author] 开发者
 * @property {string} dest 目标目录 / 项目存放目录
 * @property {boolean} destExists 目标目录是否存在
 * @property {string} destRelative 目标目录 / 项目存放目录，相对于当前运行目录的相对路径
 * @property {PackageManager} packageManager 包管理器
 */

/**
 * @typedef {("ssr"|"spa")} AppType
 */
/**
 * @typedef {("base"|"serverless"|"cm-system")} BoilerplateType
 */
/**
 * @typedef {Object} AuthorObject
 * @property {string} name
 * @property {string} [email]
 */
/**
 * @typedef {("yarn"|"npm")} PackageManager
 */
