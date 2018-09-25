# 命令

在 `koot` 正确安装后，`package.json` 内 `scripts` 中的脚本里，可使用新的命令：

- `koot-start` 打包并启动服务器
- `koot-build` 打包
- `koot-dev` 开启开发模式
- `koot-analyze` 对客户端打包结果进行分析

**示例**

```json
{
    "scripts": {
        "start": "koot-start",
        "start:server": "koot-start --no-build",
        "build": "koot-build",
        "build:client": "koot-build --client",
        "build:server": "koot-build --server",
        "dev": "koot-dev",
        "dev:client": "koot-dev --client",
        "dev:server": "koot-dev --server",
        "analyze": "koot-analyze"
    }
}
```

---

### koot-start

默认行为：进行生产模式 (ENV: prod) 的打包，并开启服务器。

**可用选项**

| 选项 | 说明 | 示例 |
|-|-|-|
| --no-build | 不进行打包，直接开启服务器 | `koot-start --no-build` |
| --type &lt;project-type&gt; | 指定项目类型，忽略 koot.js 中的配置 | `koot-start --type react-spa` |
| --config &lt;config-file-path&gt; | 指定打包配置文件地址 | `koot-start --config ./koot.build.qa.js` |

---

### koot-build

默认行为：进行生产模式 (ENV: prod) 的打包，相继对客户端环境 (STAGE: client) 和服务器端环境 (STAGE: server) 打包。

**可用选项**

| 选项 | 说明 | 示例 |
|-|-|-|
| -c 或 --client | 只对客户端环境打包 | `koot-build -c` |
| -s 或 --server | 只对服务器端环境打包 | `koot-build -s` |
| --stage &lt;client&#124;server&gt; | 指定打包环境 | `koot-build --stage client` |
| --env &lt;prod&#124;dev&gt; | 指定打包模式 | `koot-build --env dev` |
| --type &lt;project-type&gt; | 指定项目类型，忽略 koot.js 中的配置 | `koot-build --type react-spa` |
| --config &lt;config-file-path&gt; | 指定打包配置文件地址 | `koot-build --config ./koot.build.qa.js` |

以上命令可混合使用，如：`koot-build -c --env dev --config ./koot.build.qa.js`

---

### koot-dev

默认行为：进入开发模式，并自动在默认浏览器中打开首页。

**可用选项**

| 选项 | 说明 | 示例 |
|-|-|-|
| -c 或 --client | 只对客户端环境打包 | `koot-dev -c` |
| -s 或 --server | 只对服务器端环境打包 | `koot-dev -s` |
| -g 或 --global | 使用全局 PM2 | `koot-dev -g` |
| --no-open | 禁止自动打开浏览器/页面 | `koot-dev --no-open` |

注：手动指定环境时，将不会默认打开首页。

---

### koot-analyze

默认行为：进行生产模式 (ENV: prod) 客户端环境 (STAGE: client) 的打包分析，并自动打开浏览器访问对结果页面。

**可用选项**

| 选项 | 说明 | 示例 |
|-|-|-|
| -c 或 --client | 只对客户端环境打包 | `koot-dev -c` |
| -s 或 --server | 只对服务器端环境打包 | `koot-dev -s` |
| --stage &lt;client&#124;server&gt; | 指定打包环境 | `koot-build --stage client` |
| --type &lt;project-type&gt; | 指定项目类型，忽略 koot.js 中的配置 | `koot-build --type react-spa` |
| --config &lt;config-file-path&gt; | 指定打包配置文件地址 | `koot-build --config ./koot.build.qa.js` |

注：手动指定环境时，将不会默认打开首页。
