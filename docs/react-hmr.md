# React 组件热更新

在**开发环境**下，所有 React 组件均会默认启用热更新机制——当源代码文件更新后，无需刷新网页即可看到最新的结果。

#### 注意

**非 React 组件文件请勿以 `.jsx` 作为文件扩展名**

#### 不可用情形

以下形式的代码目前无法启用热更新

```jsx
import React from 'react'
import { extend } from 'koot'

export default extend({
    connect: () => ({})
})(props => <div {...props} />)
```

修改为该形式即可

```jsx
import React from 'react'
import { extend } from 'koot'

const Comp = props => <div {...props} />

export default extend({
    connect: () => ({})
})(Comp)
```
