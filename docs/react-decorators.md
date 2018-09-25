# React 组件装饰器

## `@pageinfo()`

修改页面标题和 meta 标签

```jsx
import { pageinfo } from 'koot'

@pageinfo((state/*, renderProps*/) => ({
    title: __('pages.home.title'),
    metas: [
        { 'server-timestamp': state.feature.ts },
    ]
}))
class HomePage extends React.Component {
    // ...
}
```

## `@fetchdata()`

同构数据

```jsx
import { connect } from 'react-redux'
import { fetchdata } from 'koot'
import { fetchArticleList } from '@api/article'

@connect(state => ({
    list: state.article.list
}))
@fetchdata(
    // 方法：获取数据，需要返回 Promise
    // 如果提供了 checkLoaded() 方法，组件中会获得 props.loaded 属性，表示数据是否读取完毕
    (state, renderProps, dispatch) => {
        // 本例中 dispatch(fetchArticleList()) 为 Promise
        return dispatch(fetchArticleList())
    }, {
        // 方法：判断数据是否准备好
        // 需要返回 Boolean
        checkLoaded: (state, props) => {
            return Array.isArray(props.list)
        },
        // 数据载入时渲染的内容。如果提供，在载入数据时会渲染该内容。
        // loader: (
        //     <div className="loader">Loading...</div>
        // ),
    }
)
class ArticleList extends React.Component {
    // ...
    render() {
        // 如果 @fetchdata 中提供了 checkLoaded 方法，组件中会新增 loaded 属性，用以表示数据是否已被读取
        if (this.props.loaded)
            return 'LOADING...'
        return (
            <div>
                {/* ... */}
            </div>
        )
    }
}
```

## `@ImportStyle()`
