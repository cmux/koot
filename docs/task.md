# 命令

在 `super-project` 正确安装后，`package.json` 内 `scripts` 中的脚本里，可使用新的命令：

- `super-start` 打包并启动服务器
- `super-build` 打包
- `super-dev` 开启开发模式
- `super-analyze` 对客户端打包结果进行分析

**示例**

```json
{
    "scripts": {
        "start": "super-start",
        "start:server": "super-start --no-build",
        "build": "super-build",
        "build:client": "super-build --client",
        "build:server": "super-build --server",
        "dev": "super-dev",
        "dev:client": "super-dev --client",
        "dev:server": "super-dev --server",
        "analyze": "super-analyze"
    }
}
```

### super-start

默认行为：进行生产模式 (ENV: prod) 的打包，并开启服务器。

**可用选项**

| 选项 | 说明 | 示例 |
|-|-|-|
| --no-build | 不进行打包，直接开启服务器 | `super-start --no-build` |

### super-build

默认行为：进行生产模式 (ENV: prod) 的打包，相继对客户端环境 (STAGE: client) 和服务器端环境 (STAGE: server) 打包。

**可用选项**

| 选项 | 说明 | 示例 |
|-|-|-|
| -c 或 --client | 只对客户端环境打包 | `super-build -c` |
| -s 或 --server | 只对服务器端环境打包 | `super-build -s` |
| --stage \<client\|server\> | 指定打包环境 | `super-build --stage client` |
| --env \<prod\|dev\> | 指定打包模式 | `super-build --env dev` |
| --config \<config-file-path> | 指定打包配置文件地址 | `super-build --config ./super.build.qa.js` |

以上命令可混合使用，如：`super-build -c --env dev --config ./super.build.qa.js`

### super-dev

默认行为：进入开发模式，并自动在默认浏览器中打开首页。

**可用选项**

| 选项 | 说明 | 示例 |
|-|-|-|
| -c 或 --client | 只对客户端环境打包 | `super-dev -c` |
| -s 或 --server | 只对服务器端环境打包 | `super-dev -s` |

注：手动指定环境时，将不会默认打开首页。
