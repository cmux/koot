# koot-proxy


koot 框架系列的代理功能。


## 安装

```
$ npm install koot-proxy
```

## API

### 服务器转发Ajax

```
serverAjaxProxy
```

在koot框架目录的 /server/router/index.js 文件中添加如下代码

```js
const { serverAjaxProxy } = require('koot-proxy')

router.get('/api/proxy', async (ctx) => {
    ctx.body = await serverAjaxProxy({
        method: 'GET',
        url: ctx.query.url
    })
})
```

前端页面Ajax请求接口地址替换为 /api/proxy?url=实际的ajax请求地址 (注：url需要经过 encodeURIComponent 编码)


