# `koot-router`

## 概念

**路由器的概念**

链接两个或多个设备

**前端路由器**

应该是页面组件的组织者，用于连接两个/或多个组件

**koot-router** 

是基于 react-router 的 纯json 的路由组织方式

**koot-router** 

想要以一份通用且易理解的json格式来描述路由及组件相关的关系

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
> 如果使用了koot-boilerplate（基础模板），请替换/src/routes/index.js为下面的文件

File:index.js

```js
    import kootRouter from 'koot-router';
    import routerConfig from './config.js';

    const router = new kootRouter(routerConfig);
    
    router.beforeEach = (nextState, replace, callback) => {
        // do...
        callback();
    }

    export default router.reactRouter;
```

> 同级目录中添加路由配置文件

File:config.js

```js
    // UI 组件以实际使用修改
    import AppView from '@views/app.view.jsx';
    import DefaultView from '@views/default.view.jsx';
    import OtherView from '@views/other.view.jsx';

    export default {
        path: '/',
        component: AppView,
        redirect: '/other',
        // 建议：把页面相关信息配置在meta对象里，
        //      或者一些自定义数据放在meta里，
        //      在组件的this.props.router.meta中获取
        meta: {
            title: '首页',
            icon: '', // 支持 () => return JSX,
        },
        children: [
            {
                // path: ''，表示默认匹配的路由
                // eg: www.domain.com/ 配到这里
                path: '',
                component: DefaultView,
            },
            {
                // eg: www.domain.com/other 配到这里
                path: 'other',
                component: OtherView,
            },
            {
                path: 'more',
                component: MoreComponent,
                // 如果还有子路由可添加children属性，继续配置
                children: [
                    {
                        path: 'child',
                        component: ChildComponent
                    },
                ]
            }
        ]
    }
```

## 路由配置文件说明

> 即上面提到的 File:config.js

### component
 
配置路由对应的组件，举例：

```js
// 1. 加载“不分包”的组件。
{
    component: require('@views/home').default)
}
```

```js
// 2. 加载“分包”的组件
{
    component: (nextState, cb) => {
        require.ensure([], (require) => {
            if (routeCheck(nextState)) cb(null, require('@views/home').default)
        }, 'page-home')
    }
}
```
 可以直接指定要渲染的组件或者webpack的异步加载函数，而无需区分 component/getComponent。

### redirect 

可以直接指向你要重定向的完整路径，当匹配到你所定义的 redirect 层时，会发生重定向动作

### meta

为自定义属性，建议一些自定义的扩展路由的相关数据放在 meta 内。

### children
子路由，你可以在子路由配置 path = '' 的对象，来取代原来的 indexRouter，从而明确了路由该有的上下级关系。

## 全局钩子函数

### beforeEach

* 在每次路由渲染之前执行
* nextState 即将进入的路由状态信息
* replace 等同 react-router onEnter 的 replace ，你可以在 callback 之前进行重定向
* callback 继续渲染的回调函数，想要页面继续渲染，你必须执行 callback 回调函数

```js
    router.beforeEach = (nextState, replace, callback) => {
        // do...
        callback();
    }
```

### afterEach

* 在每次路由渲染之后执行；
* 只会接受当前渲染完成的路由状态

```js
    router.afterEach = (state) => {
        // do...
    }
```

### onUpdate

* 每次路由更新时执行
* 只会接受当前渲染完成的路由状态

```js
    router.onUpdate = (state) => {
        // do...
    }
```
