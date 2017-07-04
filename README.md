# react-koa-sbase-boilerplate

基于 [react-koa-sbase](url=https://github.com/dongwenxiao/react-koa-sbase) 构建的模板项目

Online: [http://super.websage.cn](url=http://super.websage.cn/)

## 特性

- ES6 \ Babel \ [Less|Sass]
- React \ Redux \ Koa2 \ Webpack2 \ Yarn
- React Server-render \ SEO
- HTML自定义
- Meta自定义和动态修改 [facebook|twitter|wechat|weibo]
- 按需加载组件 [JS、CSS]
- 异步路由
- 多语言
- Loading 动画
- 模块化开发
- 第三方统计接入
- sp-* 系列扩展
- IE 11+
- 1套代码输出多客户端版本？
- 自定义最先执行JS[critical.js]
- 自定义koa-middleware
- 自定义http-header
- 服务端和客户端请求数据共用代码
- css class 重命名


## 目录结构

> 大型项目

用```features```划分目录结构

> 中小型项目

用```ui``` ```pages``` 划分目录结构


## 使用

建议使用 ```cnpm``` 或 ```yarn``` 代替 ```npm```


```
// 安装依赖
npm i

// 打包并启动
npm start

// 或使用 pm2
yarn pm2-start

```




打开 [http://localhost:3000/](http://localhost:3000/) 看效果


## 开发模式

开启3个命令行窗口

```
# 第一个客户端实时打包
yarn client-dev
```


```
# 第二个服务端实时打包
yarn server-dev
```


```
# 第三个服务端运行（在第二步完成后执行）
yarn server-run
```

或者使用

```
# pm2 管理3个进程
yarn pm2-dev
```


打开 [http://localhost:3000/](http://localhost:3000/) 看效果

## Todo

客户端缓存 PWA 、 localStrange + manifest


## 注意

 * 目前使用的ejs模板引擎访问的views文件夹路径不能改变，也不会随之打包到dist下面，目前koa-views(sp-koa-views)只支持模板绝对路径。

 * sp-koa-views 设置多目录时候，模板名字不要重复，会默认找到第一个同名模板。