# 全局与工具函数

_Koot.js_ 提供许多全局函数与工具函数，项目代码中可随意调用这些函数并使用。

> 项目代码指所有经过 _Webpack_ 处理的 _JavaScript_ 文件的代码。通常来说，除了 _Koot.js_ 项目配置文件 (`koot.config.js`)、_Babel_ 配置文件 (`babel.config.js`) 等配置文件外，其他所有的代码文件都会经过 _Webpack_ 处理。

---

### 全局函数

所有的全局函数都均引用自 `koot`，如：

```javascript
import { extend, getLocaleId } from 'koot';
```

目前提供以下全局函数

| 函数名        | 用途                                                                                            |
| ------------- | ----------------------------------------------------------------------------------------------- |
| `extend`      | React 高阶组件。用途与用法详见 [React/高阶组件](/react?id=高阶组件-extend)                      |
| `getStore`    | 获取当前的 _Redux store_。有关在 _Koot.js_ 中使用 Redux 和 store 存储空间，详见 [Store](/store) |
| `getHistory`  | 获取当前的 _History_ 对象                                                                       |
| `getLocaleId` | 获取当前匹配的语种 ID。有关释义和在 _Koot.js_ 中开发多语言，详见 [多语言](/i18n)                |

---

### 工具函数

工具函数均引用自 _Koot_ 目录下的独立文件，如：

```javascript
import getClientFilePath from 'koot/utils/get-client-file-path';
```

目前提供以下全局函数

-   `utils/get-client-file-path(filename)`
    -   _仅服务器端_
    -   获取目标文件的访问地址
-   `utils/read-client-file(filename)`
    -   _仅服务器端_
    -   读取目标文件的内容
