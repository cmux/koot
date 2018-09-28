# React 组件热更新

在**开发模式**下，所有 React 组件均会默认启用热更新机制——当源代码文件更新后，无需刷新网页即可看到最新的结果。

#### 不可用情形

以下形式的代码目前无法启用热更新

```jsx
import React from 'react'
import { wrapper } from 'koot'

export default wrapper({
    connect: () => ({})
})(props => <div {...props} />)
```

修改为该形式即可

```jsx
import React from 'react'
import { wrapper } from 'koot'

const C = props => <div {...props} />

export default wrapper({
    connect: () => ({})
})(C)
```
