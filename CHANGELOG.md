## 0.5.14
**2018-12-04**
- 核心
  - PWA
    - `service-worker` 默认行为调整，现在初始时仅会对 `.js` 文件进行缓存
- React
  - 高阶组件 `extend()`
    - `connect` 现在支持传入 Array，以对应 `react-redux` 的 `connect()` 的多参数情形
- 错误修正
  - 修复某些情况下，同构服务器启动端口不正确的问题

## 0.5.13
**2018-11-23**
- 错误修正
  - 修复并发访问时存在多个 `koot-locale-id` meta 标签的问题

## 0.5.12
**2018-11-22**
- 核心
  - 多语言
    - 翻译方法 (默认 `__()`) 现在支持语言包中类型为 `Array` 的内容

## 0.5.11
**2018-11-16**
- React
  - 高阶组件 `extend()`
    - `pageinfo` 和 `data` 不再要求必须使用 `connect`

## 0.5.7
**2018-11-07**
- 错误修正
  - 修复生成了错误的多语言跳转 meta 链接地址的问题

## 0.5.6
**2018-10-29**
- 核心
  - Webpack
    - 写入打包配置记录文件时如果发生错误，现在会忽略该错误，并继续流程

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
