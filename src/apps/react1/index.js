import isomorphic from '../../modules/sp-react-isomorphic'
import { reactApp } from './client'
import { template } from './html'

// 

const Koa = require('koa')
const app = new Koa()

//


// 同构配置

app.use(isomorphic({

    // react-router 配置对象
    routes: reactApp.react.router.get(),

    // redux store 对象
    configStore: reactApp.createConfigureStoreFactory(),

    // HTML基础模板
    template: template,

    // 打包结果目标目录，如果为空默认为 /dist
    // distPathName: '/dist',

    // 对HTML基础模板的自定义注入
    // 例如：<script>//inject_critical</script>  替换为 critical
    injection: {
        // js: (args) => `<script src="${args.path}/client.js"></script>`,
    }
}))


module.exports = app