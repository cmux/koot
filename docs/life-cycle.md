# Koot.js 生命周期

### 客户端

在浏览器中运行的代码。


方法 | 描述 
- | -
```before()``` | 在React渲染之前运行。
```after()```  | 在React渲染之后运行。
```onRouterUpdate()``` | 在路由改变的时候运行。
```onHistoryUpdate()``` | 在浏览器的地址栏URL改变的时候运行。



### 服务端

在Node程序中运行的代码，主要实现Koa的中间件挂载顺序。

方法 | 描述 
- | -
```before({ koaApp })``` | 在React的ServerRender中间件使用之前挂载。
```after({ koaApp })```  | 在React的ServerRender中间件使用之后挂载。
```onRender({ ctx, store })``` | 在React的ServerRender中间件运行时候调用。


### React组件

在React Server Render的情况，开发时候可能需要对HTML、页面初始化状态进行扩展，所以Koot.js对React组件的生命周期做了扩展。

方法 | 描述 
- | -
```onServerRenderStoreExtend({ store })``` | 在React的SSR期间被调用，参数store是redux的store。<br>store使用:<br> - ```store.dispatch({...}) //扩展state``` <br> - ```store.getState() //获取全部state```
```onServerRenderHtmlExtend({ store, htmlTool })```  | 在React的SSR期间被调用，参数store是redux的store 和 htmlTool是用于扩展html的工具对象。<br>store使用:<br> - ```store.dispatch({...}) //扩展state``` <br> - ```store.getState() //获取全部state```<br>htmlTool使用: <br> - ```//TODO:待完善```


