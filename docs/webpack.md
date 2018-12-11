# Webpack 配置

### Chunkmap (Chunk 对照表)

在打包结束后，打包结果目录中会自动生成名为 `.public-chunkmap.json` 的文件，其中记录着本次打包的 Webpack 入口和最终文件的对照表

**对照表结构**

```json
{
    ".entrypoints": {
        "client": [
            "FILE #1 PATHNAME",
            "FILE #2 PATHNAME"
        ],
        "ENTRY#2": [
            "FILE #1 PATHNAME"
        ]
    },
    ".files": {
        "client.js": "PATHNAME",
        "client.css": "PATHNAME - 从以 client 为入口的 js 文件中抽取的 CSS 文件",
        "CHUNK#1.js": "PATHNAME - chunk #1 的 js 文件打包结果"
    },
    "CHUNK#1": [
        "PATHNAME - chunk #1 的 js 文件打包结果"
    ],
    "client": [
        "FILE #1 PATHNAME",
        "FILE #2 PATHNAME",
        "PATHNAME - 从以 client 为入口的 js 文件中抽取的 CSS 文件",
    ]
}
```

**多语言分包项目的对照表结构**

```json
{
    ".en": {
        "对应语言 en": "的对照表结构"
    },
    ".zh": {
        "对应语言 zh": "的对照表结构"
    }
}
```

**文件地址规则**

对照表中的文件地址 (pathname) 均为相对于打包结果目录 (默认为 `./dist`) 的相对路径

**命名规则**

- 特殊项目的 key 值均以 `.` 开头，如 `.entrypoints` `.files`
