# 3.0.0
2018-??-??
  - 重构
  - `react-router` 更新到 v4

# 2.4.0
2018-02-11
  - 新增文件 `CHANGELOG.md`
  - 更新依赖库
  - `sp-isomorphic-utils`
    - `getFile`: 如果根据文件名直接匹配到目标文件，直接返回该文件名，不再继续进行文件夹内过滤
  - `sp-pwa`
    - `create`: 创建 service-worker 时，新增参数 `outputFilenameHash`，表示创建的 sw 文件名中带有 hash，默认为 `false`
      - 当前的 service-worker 规范中，浏览器不会对 sw 文件进行缓存，每次访问页面时都会尝试重新获取 sw 文件
    - `get-service-worker-file`: 更新到最新的 `getFile()` 方法
