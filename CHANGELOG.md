## 0.5.0
**2018-10-08**
- 核心
  - 为避免版本冲突，将所有 NPM 依赖包的版本改为固定版本
- 开发模式 (`koot-dev`)
  - 新的命令选项 `--no-open`：禁用自动打开浏览器
  - 针对 React 组件自动启用热更新
    - 注意事项请参见文档的 [React组件热更新](https://koot.js.org/react-hmr) 章节
- React同构 (`ReactApp`)
  - 新的高阶组件 `wrapper`
    - `import { wrapper } from 'koot'`
    - 可作为组件装饰器使用
    - 提供同构数据功能
    - 包含 `pageinfo` 和 `ImportStyle` 功能
    - 具体用法请参见文档的 [React高阶组件](https://koot.js.org/react-hoc) 章节
  - 优化 CSS 处理相关流程

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
