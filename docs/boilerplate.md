# 项目结构

### 建议的项目结构

```
[app]
├── 📄 README.md
├── 📄 .eslintrc.js
├── 📄 .gitignore
├── 📄 .prettierrc.js
├── 📄 babel.config.js
├── 📄 browserslist
├── 📄 jsconfig.json
├── 📄 koot.config.js
├── 📄 package.json
├── 📄 postcss.config.js
└── 📂 src
    ├── 📄 critical.js
    ├── 📄 global.less
    ├── 📄 index.ejs
    ├── 📄 index.inject.js
    ├── 📂 assets
    │   └── 📂 public
    │       └── 📄 favicon.ico
    ├── 📂 components
    │   ├── 📂 组件#1
    │   │   ├── 📄 index.jsx
    │   │   └── 📄 index.module.less
    │   └── 📂 组件#2
    │       ├── 📄 index.jsx
    │       └── 📄 index.module.less
    ├── 📂 constants
    │   ├── 📂 less
    │   │   └── 📄 colors.less
    │   └── 📄 action-types.js
    ├── 📂 locales
    │   ├── 📄 en.json
    │   └── 📄 zh.json
    ├── 📂 routes
    │   └── 📄 index.js
    ├── 📂 server
    ├── 📂 store
    │   ├── 📄 actions.js
    │   ├── 📄 index.js
    │   └── 📄 reducers.js
    └── 📂 views
        ├── 📂 视图#1
        │   ├── 📄 index.jsx
        │   └── 📄 index.module.less
        └── 📂 视图#2
            ├── 📄 index.jsx
            └── 📄 index.module.less
```
