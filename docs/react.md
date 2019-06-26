# React

## 高阶组件 `extend`

_Koot.js_ 为 _React_ 提供高阶组件 _extend()_，可赋予目标组件**CSS 命名空间**、**同构数据**、**更新页面信息**等能力。

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

#### 参数

-   _Function_ `connect`
    <br>`connect([mapStateToProps], [mapDispatchToProps], [mergeProps], [options])`
    <br>传入 `react-redux` 的高阶组件 `connect` 的回调函数，使用相同的结构。
-   _Object_ `styles` CSS 文本结果
    <br>使用时多为引用 CSS (Less/Sass) 文件
-   `pageinfo` 修改页面 title 和 meta 标签
    -   _Object_ `pageinfo`
        -   _String_ `pageinfo.title`
        -   _Array_ `pageinfo.metas`
    -   _Function_ `pageinfo`
        <br>`pageinfo(state, renderProps)`
        -   参数
            -   _Object_ `state` 当前 Redux state
            -   _Object_ `renderProps` 同构对象
        -   返回值：_Object_
            -   _String_ `title` 新的页面标题
            -   _Array_ `metas` 新的页面 meta 标签信息
-   `data` 同构数据相关
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
-   `ssr` 仅作用于 SSR 项目的服务器端：控制该组件的 SSR 行为
    -   默认值：`true`
    -   _Boolean_ `ssr`
        <br>该组件是否需要 SSR。
        <br>`false` 时，SSR 阶段不会渲染该组件，最终在 HTML 结果中不会出现相应的 HTML 代码。
    -   _String_|_ReactComponent_ `ssr`
        <br>在 SSR 时渲染指定的内容或组件

#### 示例：使用所有参数

```javascript
import { extend } from 'koot';
import { fetchUser } from '@api/user';

@extend({
    // connect 仅传入第一个参数
    connect: state => ({
        user: state.user || {}
    }),
    // connect 传入多个参数
    connect: [
        state => ({
            user: state.user || {}
        }),
        (dispatch, ownProps) => ({
            getUserData: () =>
                dispatch({ type: 'GET_USER_DATA', id: ownProps.id })
        })
    ],

    //
    styles: require('./styles.less'),

    // pageinfo 使用 Object 方式
    pageinfo: {
        title: __('pages.home.title'),
        metas: [{ description: __('pages.home.description') }]
    },
    // pageinfo 使用 Function 方式
    pageinfo: (state, renderProps) => ({
        title: __('pages.home.title'),
        metas: [{ description: __('pages.home.description') }]
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
        }
    },
    // data 使用 Function 方式
    data: (state, renderProps, dispatch) => {
        return dispatch(fetchUser());
    },

    // 不进行 SSR
    ssr: false,
    // SSR 时渲染该组件
    ssr: <div>Loading...</div>
})
class HomePage extends React.Component {
    // ...
}

export default HomePage;
```

## 组件获得新的 props

使用 _extend()_ 高阶组件封装后，目标组件将会获得以下新的 `props`

-   _String_ `data-class-name`
    <br>经过 hash 后本组件的 className
    <br>注: 与 `props.className` 不同，`props['data-class-name']` 仅为本组件 CSS 的 className
-   _Function_ `updatePageinfo`
    <br>如果提供了 `pageinfo` 配置，组件会新增 `props.updatePageinfo` 方法，可用来手动触发页面信息更新

## 组件热更新

在**开发环境**下，所有 React 组件均会默认启用热更新机制——当源代码文件更新后，无需刷新网页即可看到最新的结果。

#### 注

Koot.js 默认的热更新能力有以下限制：

-   仅影响扩展名为 `.jsx` 的文件
    -   非 React 组件文件请勿以 `.jsx` 作为文件扩展名
-   仅影响 `.jsx` 文件中输出 (`export`) 的组件

## 同构对象

Koot.js 自定义的对象，其中包含以下属性/元素：

_TODO:_
