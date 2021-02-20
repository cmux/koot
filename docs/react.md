# React

### 高阶组件 `extend`

_Koot.js_ 为 _React_ 提供高阶组件 _extend()_，可赋予目标组件**CSS 命名空间**、**同构数据**、**更新页面信息**等能力。

针对 _同构/SSR_ 项目，同构渲染 CSS `<style>` 标签、异步数据请求、页面标题与 `<meta>` 标签等信息，均通过该高阶组件实现。

#### 使用

```javascript
import { extend } from 'koot';

class HomePage extends React.Component {
    // ...
}

export default extend({
    // ...配置对象
})(HomePage);
```

也可以作为装饰器使用

```javascript
import { extend } from 'koot';

@extend({
    // ...配置对象
})
class HomePage extends React.Component {
    // ...
}

export default HomePage;
```

针对函数组件 (Funtional Component) 的使用

```javascript
import { extend } from 'koot';

const HomePage = extend({
    // ...配置对象
})(() => {
    // ...
});

export default HomePage;
```

**TypeScript**

```typescript

// 函数方式定义
extend<ComponentProps>(extendOptions)(FunctionalComponent)

// 装饰器方式定义
@extend(extendOptions)
ComponentClass
```

在 TypeScript 中的写法请参见 [TypeScript 开发/TSX 代码示例](/typescript?id=tsx-代码示例)

##### 参数对象属性

_Function_ `connect`

-   传入 `react-redux` 的高阶组件 `connect` 的回调函数。
-   传入多个参数的方法请见下文示例。

_Object_ `styles` 组件 CSS

-   一般情况下，该属性为引用 `css` `less` 或 `sass` 文件。
-   为该组件提供或更新 `props.className`
    -   如果父级组件传入了 `props.className`，该子组件的 `props.className` 会包含父级传入的值以及引用的组件 CSS 的样式名
    -   如果父级组件没有传入 `props.className`，该子组件的 `props.className` 仅为引用的组件 CSS 的样式名
-   该组件渲染时，这些 CSS 会作为 `<style>` 标签添加到 `<head>` 中。
-   该对象需要提供以下属性：_string_ `wrapper` 和 _string_ `css`
-   有关 CSS 的相关开发指南请查阅 [CSS](/css)

`pageinfo` 修改页面 title 和 meta 标签

-   该组件渲染时，这些信息会更新到 `<head>` 中。
-   该属性有两种用法：
    -   _Object_ `pageinfo`
        -   _string_ `pageinfo.title`
        -   _Array<MetaObject>_ `pageinfo.metas`
    -   _Function_ `pageinfo`
        <br>`pageinfo(state, renderProps)`
        -   参数
            -   _Object_ `state` 当前 Redux state
            -   _Object_ `renderProps` 同构对象
        -   返回值：_Object_
            -   _string_ `title` 新的页面标题
            -   _Array_ `metas` 新的页面 meta 标签信息
-   如果没有提供 `title`，会默认采用项目配置中的 `name` 值，如果该值也未提供，则会默认使用 `package.json` 的 `name` 属性

`data` 同构数据相关

-   该属性有两种用法：
    -   _Object_ `data`
        -   _Function_ `data.fetch` 获取数据的方法函数
            <br>`fetch(state, renderProps, dispatch)`
            -   参数
                -   _Object_ `state` 当前 Redux state
                -   _Object_ `renderProps` 同构对象
                -   _Function_ `dispatch` Redux dispatch 方法
            -   返回值：_Promise_
        -   _Function_ `data.check` 检查数据是否已准备就绪
            <br>`check(state, props)`
            -   参数
                -   _Object_ `state` 当前 Redux state
                -   _Object_ `renderProps` 同构对象
            -   返回值：_Boolean_
    -   _Function_ `data`
        <br>为 _Function_ 时，同 `data.fetch`
        <br>使用该方法时，需要自行编写检查数据的代码，推荐写在 redux action 中

`ssr` 仅作用于 SSR 项目的服务器端：控制该组件的 SSR 行为

-   默认值：`true`
-   _Boolean_ `ssr`
    <br>该组件是否需要 SSR。
    <br>`false` 时，SSR 阶段不会渲染该组件，最终在 HTML 结果中不会出现相应的 HTML 代码。
-   _string_|_ReactComponent_ `ssr`
    <br>在 SSR 时渲染指定的内容或组件

##### 示例：使用所有参数

```javascript
import { extend } from 'koot';
import { fetchUser } from '@api/user';

import styles from './styles.less';

@extend({
    // connect 仅传入第一个参数
    connect: (state) => ({
        user: state.user || {},
    }),
    // connect 传入多个参数
    connect: [
        (state) => ({
            user: state.user || {},
        }),
        (dispatch, ownProps) => ({
            getUserData: () =>
                dispatch({ type: 'GET_USER_DATA', id: ownProps.id }),
        }),
    ],

    //
    styles,

    // pageinfo 使用 Object 方式
    pageinfo: {
        title: __('pages.home.title'),
        metas: [{ name: 'description', content: __('pages.home.description') }],
    },
    // pageinfo 使用 Function 方式
    pageinfo: (state, renderProps) => ({
        title: __('pages.home.title'),
        metas: [{ name: 'description', content: __('pages.home.description') }],
    }),

    // data 使用 Object 方式
    data: {
        fetch: (state, renderProps, dispatch) => {
            return dispatch(fetchUser());
        },
        check: (state, renderProps) => {
            return (
                typeof renderProps.user === 'object' &&
                typeof renderProps.user.id !== 'undefined'
            );
        },
    },
    // data 使用 Function 方式
    data: (state, renderProps, dispatch) => {
        return dispatch(fetchUser());
    },

    // 不进行 SSR
    ssr: false,
    // SSR 时渲染该组件
    ssr: <div>Loading...</div>,
})
class HomePage extends React.Component {
    // ...
}

export default HomePage;
```

##### 组件获得新的 props

使用 _extend()_ 高阶组件封装后，目标组件将会获得以下新的 `props`

| 属性名            | 类型              | 解释                                                                                                                                                                                                                                                                                                                   |
| ----------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `className`       | `string`          | 如果通过 `extend()` 高阶组件封装并指定了 `styles` 属性：<br>父组件传入的 `className` 以及经过 hash 后本组件的 `className`<br><br>否则：<br>父组件传入的 `className` 属性                                                                                                                                               |
| `data-class-name` | `string`          | 经过 hash 后本组件的 className<br>与 `className` 不同，该属性仅为本组件的组件 CSS 的 `className`                                                                                                                                                                                                                       |
| `updatePageinfo`  | `Function`        | 可用来手动触发页面信息更新<br><br>可传入 _Object_ 或 _Function_，语法与 `connect()` 高阶组件的 `pageinfo` 的用法相同<br>如果没有传入参数，会使用 `extend()` 高阶组件中的 `pageinfo` 的值<br><br>⚠️ 仅在客户端环境下使用才有意义，服务器环境下该属性无效<br>⚠️ 仅在 `extend()` 高阶组件中使用 `pageinfo` 属性时才会存在 |
| `forwardedRef`    | `React.RefObject` | 使用该组件时如果传入了 `ref` 属性，该组件会出现 `forwardedRef` 属性用以转发/接收 `ref` 值                                                                                                                                                                                                                              |

---

### 组件热更新

在**开发环境**中，所有 React 组件均会默认启用热更新机制

> 所谓热更新，即在编辑器中修改并保存了代码文件后，无需刷新网页即可看到最新的结果。

⚠️ Koot.js 默认的热更新能力有以下限制：

-   仅影响扩展名为 `.jsx` `.tsx` 的文件
    -   非 React 组件文件请勿以 `.jsx` `.tsx` 作为文件扩展名
-   仅影响文件中输出 (`export`) 的组件，没有输出的组件不会有热更新

**有关 `memo()`**

出于某些限制，目前 _Koot.js_ 仍在使用 `react-hot-loader`，其作者已经表示不再维护，目前已知对 `memo()` 组件的热更新支持不佳。

为了缓解这一问题，在开发环境中，所有的 `memo()` 函数都会被**自动地**替换为组件本身，从而使热更新可用，但这样一来和生产环境地结果就有了一定的偏差，在开发时请注意。

⚠️ 在未来会更新为全新的 _Fast Refresh_ 机制，从而杜绝这一现象

### 同构对象

Koot.js 自定义的对象，其中包含以下属性/元素：

_TODO:_
