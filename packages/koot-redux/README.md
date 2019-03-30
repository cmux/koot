# `koot-redux`

> 模块化的 redux 组织方案

> Redux 是一个成功的且扩展性极强的状态化管理器，但是其复杂且繁琐的开发体验是在是让人头疼

* 当我们要完成一个复杂的业务时候，我们要管理大量的 createAction, action, reducer
* Action 本身可以理解为一个定义，并不是真实存在的逻辑，为了完成异步 我们需要使用 reudx-thunk
* ...

> koot-redux 参考了 vuex 的 Store 模块化的管理方案, 在不改变 redux 核心的情况下，可以以模块的方式创建 action, reducer，不但能体验 redux 所带来的好处，也优化了复杂的 action&reducer 的创建管理过程

> koot-redux 同样尊循着与 redux 一样的原则

## 安装

### NPM
```shell
npm install koot-redux --save
```

### Yarn
```shell
yarn koot-redux
```

## 快速使用

> 利用koot-cli 创建的模板项目，可按照如下修改使用。

修改 File: /src/store/index.js
```js
    import { createReduxModuleStore, applyMiddleware } from 'koot-redux'
    import { reduxForCreateStore } from 'koot'
    import rootModule from './root'

    const middlewares = [
        ...reduxForCreateStore.middlewares
    ]

    export default () => {

        const {
            initialState
        } = reduxForCreateStore


        if (__CLIENT__ && __DEV__) {
            return createReduxModuleStore(
                rootModule,
                initialState,
                require('redux-devtools-extension').composeWithDevTools(applyMiddleware(...middlewares))
            )
        }

        return createReduxModuleStore(
            rootModule,
            initialState
        )

    }
```

添加 File: /src/store/root.js 
```js
    import { reduxForCreateStore } from 'koot'

    export default {
        state: {

            ...reduxForCreateStore.reducers
        },
        reducers: {
            ['SOME_REDUCER_FUNCTION']() {

            }
        },
        actions: {
            ['SOME_ACTION_FUNCTION']() {

            }
        },
        modules: {
            // 此处可扩展子集的 module 模块
        }
    }
```



## Module
在 koot-redux 中，
* 一个完整的 store 树就是以个层层嵌套的 module 树，
* 每个 module 管理自己的 state, action, reducer
* reducer 必须是同步的
* action 是必须存在的逻辑，你必须 dipatch 一个 action, 且在 action 内 commit 一个 reducer

module.js

```js
    const module = {
        state: {
            // 在此处定义默认的state
            // 程序将在创建时将此处定义好的值初始化为默认值
            userinfo: {
                username: 'liudehua',
                password: '123456'
            }
        },
        reducers: {
            // reducer 为一个 funciton
            // reducer的调用名称 = funciton的名称
            ['SOME_REDUCER_FUNCTION'](state, payload){

            }
        },
        actions: {
            // action 为一个 funciton
            // action的调用名称 = funciton的名称
            ['SOME_ACTION_FUNCTION']({
                commit,
                state,
                rootState,
                dispatch
            }, payload){
                // commit 用来提交 reducer
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
            // 子级可以同样扩展自己的子级
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

## Action

这里我们将 action 实体化一个 “必须存在” 的逻辑层。

在开发中我们发现，无论是大量的异步请求，或是存储数据之前的复杂逻辑，我们都需要一个支持异步且实际存在的 action function 存在，即使是同步的需求，action 也可以通常用来处理数据存储之前的逻辑，可使得 reducer 的功能更纯净，且给未来的开发带来了足够的扩展性。

所以当你执行派发操作时，你必须在先执行一个 action
然后在 action 中，提交你要执行的 reducer 操作

### 派发 action
```js
    // 派发 action
    this.props.dispatch('SOME_ACTION_NAME')
```

### action函数及参数
```js
    // commit 用来提交 reducer
    // eg: commit('SOME_REDUCER_FUNCTION', payload)

    // state 用来获取当前模块的局部 state
    // eg: state.userinfo.username

    // rootState 整个状态树的根层，你可以再此拿到整个状态树
    // eg: rootState.App.test

    // dispatch 可以继续派发其他的 action 操作
    // eg: dispatch('OTHER_ACTION_FUNCTION')

    ['SOME_ACTION_NAME']({commit, state, rootState, dispatch}, payload){
        commit('SOME_REDUCER_NAME', payload)
    }
```

## Reducer

* 我们建议 reducer 是一个纯净的、同步的存储过程，只跟数据存储本身有关。
* 是否存储或其他业务判断逻辑我们推荐写到 action 当中。

