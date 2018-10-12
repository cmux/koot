# React 高阶组件

## 组件扩展 (`extend`)

#### 使用

```jsx
import { extend } from 'koot'

class HomePage extends React.Component {
    // ...
}

export default extend({
    pageinfo: (state, renderProps) => ({
        title: __('pages.home.title'),
        metas: [
            { 'description': __('pages.home.description') },
        ]
    })
})(HomePage)
```

也可以作为装饰器使用

```jsx
import { extend } from 'koot'

@extend({
    // ...
})
class HomePage extends React.Component {
    // ...
}

export default HomePage
```

#### 参数

- _Function_ `connect`
<br>`connect([mapStateToProps], [mapDispatchToProps], [mergeProps], [options])`
<br>传入 `react-redux` 的高阶组件 `connect` 的回调函数，使用相同的结构。
- _Function_ `pageinfo` 修改页面 title 和 meta 标签
<br>`pageinfo(state, renderProps)`
  - 参数
    - _Object_ `state` 当前 Redux state
    - _Object_ `renderProps` [组件同构属性对象](/react-render-props)
  - 返回值：_Object_
    - _String_ `title` 新的页面标题
    - _Array_ `metas` 新的页面 meta 标签信息
- _Object_ `data`
<br>同构数据相关
  - _Function_ `data.fetch` 获取数据的方法函数
    <br>`fetch(state, renderProps, dispatch)`
    - 参数
      - _Object_ `state` 当前 Redux state
      - _Object_ `renderProps` [组件同构属性对象](/react-render-props)
      - _Function_ `dispatch` Redux dispatch 方法
    - 返回值：_Promise_
  - _Function_ `data.check` 检查数据是否已准备就绪
    <br>`check(state, props)`
    - 参数
      - _Object_ `state` 当前 Redux state
      - _Object_ `renderProps` [组件同构属性对象](/react-render-props)
    - 返回值：_Boolean_
- _Function_ `data`
<br>为 _Function_ 时，同 `data.fetch`
<br>该情况下，数据检查操作建议写在 redux action 中
- _Object_ `styles` CSS 结构

#### 示例：使用所有参数

```jsx
import { extend } from 'koot'
import { fetchUser } from '@api/user'

@extend({
    connect: (state) => ({
        user: state.user || {}
    }),
    pageinfo: (state, renderProps) => ({
        title: __('pages.home.title'),
        metas: [
            { 'description': __('pages.home.description') },
        ]
    }),
    data: {
        fetch: (state, renderProps, dispatch) => {
            return dispatch(fetchUser())
        },
        check: (state, renderProps) => {
            return typeof renderProps.user === 'object' && typeof renderProps.user.id !== 'undefined'
        }
    },
    styles: require('./styles.less')
})
class HomePage extends React.Component {
    // ...
}

export default HomePage
```
