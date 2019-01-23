# `koot-router`

> 路由器的概念：链接两个或多个设备

> 前端路由器：应该是页面组件的组织者，用于连接两个/或多个组件

> koot-router 是基于 react-router 的 纯json 的路由组织方式

> koot-router 想要以一份通用且易理解的json格式来描述路由及组件相关的关系

## 安装

### NPM
```
    npm install koot-router --save
```

### Yarn
```
    yarn koot-router
```

## 使用

router/index.js

```
    import kootRouter from 'koot-router';
    import routerConfig from './config.js';

    const router = new kootRouter(routerConfig);
    
    router.beforeEach = (nextState, replace, callback) => {
        // do...
        callback();
    }

    export default router.reactRouter;
```

router/config.js

```
    import AppView from '@views/app.view.jsx';
    import DefaultView from '@views/default.view.jsx';
    import OtherView from '@views/other.view.jsx';

    export default {
        path: '/',
        component: AppView,
        redirect: '/other',
        meta: {
            name: '根目录',
            icon: // 支持 () => return JSX,
            title: '',
        },
        children: [
            {
                path: '',
                component: DefaultView,
            },
            {
                path: 'other',
                component: OtherView,
            }
        ]
    }
```

## router config item api

* component
> 可以直接指定要渲染的组件或者，webpack 的异步加载函数，而无需区分 component/getComponent

* redirect 
> 可以直接指向你要重定向的完整路径，当匹配到你所定义的 redirect 层时，会发生重定向动作

* meta
> 为自定义属性，建议一些自定义的扩展路由的相关数据放在 meta 内。

* children
> 子路由
> 你可以在子路由配置 path = '' 的对象，来取代原来的 indexRouter
> 从而明确了路由该有的上下级关系

## 全局钩子函数

### beforeEach

* 在每次路由渲染之前执行
* nextState 即将进入的路由状态信息
* replace 等同 react-router onEnter 的 replace ，你可以在 callback 之前进行重定向
* callback 继续渲染的回调函数，想要页面继续渲染，你必须执行 callback 回调函数

```
    router.beforeEach = (nextState, replace, callback) => {
        // do...
        callback();
    }
```

### afterEach

* 在每次路由渲染之后执行；
* 只会接受当前渲染完成的路由状态

```
    router.afterEach = (state) => {
        // do...
    }
```

### onUpdate

* 每次路由更新时执行
* 只会接受当前渲染完成的路由状态

```
    router.onUpdate = (state) => {
        // do...
    }
```
