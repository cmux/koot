# `koot-redux`

> 模块化的 redux 组织方案

> Redux 是一个成功的且扩展性极强的状态化管理器，但是其复杂且繁琐的开发体验是在是让人头疼

* 当我们要完成一个复杂的业务时候，我们要创建大量的 action 对象
* 要创建大量的 createAction 来完成异步操作
* 要创建大量的 createAction 来完成复杂的 reducer 调用逻辑
* 每个 state 都对应一个 reducer，因此创建了大量的 reducer
* 复杂的业务的时候，单层的 state 状态往往不能满足我们的需求，因此产生了更多的 createAction & reducer
* 为了完成异步 我们需要使用 reudx-thunk 
* ...

> 因此 koot-redux 参考了 vuex 的 Store 模块化的管理方案, 在不改变 redux 核心的情况下，在创建 action, reducer 的形式上做了一定的封装，不但能体验 redux 所带来的好处，也优化了复杂的 action&reducers 的创建管理过程

> koot-redux 同样尊循着与 redux 一样的原则


## 安装

### NPM
```
    npm install koot-redux --save
```

### Yarn
```
    yarn koot-redux
```

## Module
在 koot-redux 中，我们以 Module 为一个单位

```
    const module = {
        state: {
            // 在此处定义默认的 state
            // 程序将在创建时将此处定义好的值初始化为默认值
            userinfo: {
                username: 'liudehua',
                password: '123456'
            }
        },
        reducers: {
            // reducer 为一个 funciton
            // reducer 的调用名称 = funciton 的名称
            ['SOME_REDUCER_FUNCTION'](state, payload){

            }
        },
        actions: {
            // action 为一个 funciton
            // action 的调用名称 = funciton 的名称
            ['SOME_ACTION_FUNCTION']({
                commit,
                state,
                rootState,
                dispatch
            }, payload){
                // commit 用来提交 reducer
                // eg: commit('SOME_REDUCER_FUNCTION', payload)

                // state 用来获取当前模块的局部 state
                // eg: state.userinfo.username

                // rootState 整个状态树的根层，你可以再此拿到整个状态树
                // eg: rootState.App.test

                // dispatch 可以继续派发其他的 action 操作
                // eg: dispatch('OTHER_ACTION_FUNCTION')
            }
        },
        modules: {
            // 此处可扩展子集的 module 模块
            // 且可以无限的扩展
            App: {
                state: {
                    test: 1
                },
                reducers: {},
                actions: {},
                modules: {}
            }
        }
    }
```

## Action

这里我们将 action 实体化一个 “必须存在” 的流程。

在开发中我们发现，无论是大量的异步请求，或是存储数据之前的复杂逻辑，我们都需要一个支持异步且实际存在的 action function 存在，且给未来的开发带来了足够的扩展性。

所以当你执行派发操作时，你必须在先执行一个 action
然后在 action 中，提交你要执行的 reducer 操作
```
    this.props.dispatch('SOME_ACTION_NAME')
```


## 创建 store 

index.js
```
    import React from 'react';
    import { render } from 'react-dom';
    import { Provider } from 'react-redux';
    import { createReduxModuleStore } from 'koot-redux';
    import rootModule from './store';
    import App from './components/App'

    const store = createReduxModuleStore(rootModule);

    render(
        <Provider store={store}>
            <App />
        </Provider>,
        document.getElementById('root')
    )
```

./store/index.js
```
    const rootModule = {
        state: {
            // 在此处定义默认的 state
            // 程序将在创建时将此处定义好的值初始化为默认值
            userinfo: {
                username: 'liudehua',
                password: '123456'
            }
        },
        reducers: {
            ['SOME_REDUCER_FUNCTION'](){

            }
        },
        actions: {
            ['SOME_ACTION_FUNCTION'](){

            }
        },
        modules: {
            // 此处可扩展子集的 module 模块
        }
    }
```





在创建 store 的过程中，koot-redux 与 redux 
```
npm i koot-redux --save-dev

import { createReduxModuleStore } from 'koot-redux';
// createReduxModuleStore 是 koot-redux 扩展的创建 store 方法
    // 其他的 api 与 redux 一致
    // eg: import { applyMiddleware } from 'redux';

```
