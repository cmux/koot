# Super.js 生命周期

### 客户端

在浏览器中运行的代码。


方法 | 描述 
- | -
```before()``` | 在React渲染之前运行。
```after()```  | 在React渲染之后运行。
```routerUpdate()``` | 在路由改变的时候运行。
```historyUpdate()``` | 在浏览器的地址栏URL改变的时候运行。



### 服务端

在Node程序中运行的代码，主要实现Koa的中间件挂载顺序。

方法 | 描述 
- | -
```before({ koaApp })``` | 在React的ServerRender中间件使用之前挂载。
```after({ koaApp })```  | 在React的ServerRender中间件使用之后挂载。
```render({ koaCtx, reduxStore })``` | 在React的ServerRender中间件运行时候调用。

