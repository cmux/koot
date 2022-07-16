# 接入: Qiankun

_Koot.js_ 从 **0.15** 开始原生支持 _Qiankun_ 项目的开发。

**基座项目**与**子项目**均需要进行一系列手动设置，请参阅本文档。

⚠ 注 ⚠ 当前默认仅支持 SPA 项目

---

### 基座项目

1. 安装 NPM 包 `qiankun`，目前实测支持 _v2.7_

    - Yarn: `yarn add qiankun`
    - NPM: `npm install qiankun`

2. 在根组件中添加微前端子项目注册代码

```jsx
// 如果根组件为 Class 组件

import { registerMicroApps, start } from 'qiankun';

class App extends React.Component {
    constructor (super) {
        super();

        // 注册 Qiankun 子项目
        registerMicroApps([
            {
                /** 子项目注册名，对应子项目配置中的字段，见下文 */
                name: 'SUB_APP_NAME',

                /** 子项目独立访问地址 */
                entry: __DEV__
                    ? '//localhost:5100'
                    : '//sub.app.cmcm.com',

                /** 用以渲染子项目的容器 */
                container: `#__qiankun_sub_root__`,

                /** 在基座项目中访问该路由时，将会渲染子项目 */
                activeRule: '/_market',
            },
        ]);

        // 使用上述配置开启 Qiankun 基座项目
        start({
            sandbox: {
                strictStyleIsolation: true,
            },
        });

        // ...
    }
}
```

```jsx
// 如果根组件为 函数组件

import { registerMicroApps, start } from 'qiankun';

const App = () => {
    if (!App.QiankunStarted) {
        // 注册 Qiankun 子项目
        registerMicroApps([
            {
                /** 子项目注册名，对应子项目配置中的字段，见下文 */
                name: 'SUB_APP_NAME',

                /** 子项目独立访问地址 */
                entry: __DEV__
                    ? '//localhost:5100'
                    : '//sub.app.cmcm.com',

                /** 用以渲染子项目的容器 */
                container: `#__qiankun_sub_root__`,

                /** 在基座项目中访问该路由时，将会渲染子项目 */
                activeRule: '/_market',
            },
        ]);

        // 使用上述配置开启 Qiankun 基座项目
        start({
            sandbox: {
                strictStyleIsolation: true,
            },
        });

        App.QiankunStarted = true;
    }

    return (
        // ...
    )
}
```

---

### 子项目

1. 安装 NPM 包 `koot-qiankun`

    - Yarn: `yarn add koot-qiankun`
    - NPM: `npm install koot-qiankun`

2. 修改项目配置文件 (默认为 `koot.config.js`) 中的如下配置项，如不存在则在配置对象内追加：
    - `type` -> `"react-spa"`
    - `target` -> `"qiankun"`
    - `qiankun` -> `{ name: 'SUB_APP_NAME' }`

---

### 子项目相关配置项

```javascript
// Koot.js App 配置文件
module.exports = {
    // 默认值
    // ⚠注⚠ 默认值不可用，需要至少设置 `qiankun.name`
    qiankun: {},

    // 详细配置。配置项及其说明详见下表
    qiankun: {
        [option]: 'value',
    },
};
```

**`qiankun` 选项**

| 项名          | 值类型   | 默认值                       | 解释                                                             |
| ------------- | -------- | ---------------------------- | ---------------------------------------------------------------- |
| `name` (必须) | `string` | _undefined_                  | 子项目注册用名，需要与基座项目（主项目）中注册的子项目的名字一致 |
| `qiankun`     | `string` | 'koot-qiankun/libs/entry.js' | 子项目的 _Entry_ (入口) 脚本                                     |
| `basename`    | `string` | _undefined_                  | 为该子项目自动添加的路由前缀                                     |

---

### 开发建议

-   基座项目
    -   为子项目路由 (配置时的 `activeRule`) 指定一个路由，可不给定组件，或为空组件
-   子项目
    -   `:root` `html` `body` 上的 CSS 转移到自有容器中
    -   尽量不要操作 `window` 对象
    -   在 _Koot.js_ 的 `RootContext` 中包含 `rootProps.qiankun` 对象，内容为 _Qiankun_ 在挂在组件时传入的属性

```jsx
const { useRef } from 'react;
const Component = () => {
    const { rootProps: { qiankun } } = useRef(RootContext);
    qiankun?.setGlobalState({ test: 'newState' });
    return null;
}
```
