# 接入: Electron

_Koot.js_ 从 **0.14** 开始原生支持 _Electron_ 项目的开发。

利用 `koot-cli` 创建新项目时可以根据向导直接创建 _Electron_ 项目并自动完成相关环境的配置。如需手动配置开发环境，如从老版本的 _Koot.js_ 项目升级，请参阅本文档。

_Electron_ 主文件、打包可执行文件的方式等功能，均可以进行配置，请参阅本文档。

---

### 手动配置开发环境

1. 安装依赖包 `koot-electron`
    - Yarn: `yarn add koot-electron --dev`
    - NPM: `npm install koot-electron --save-dev`
2. 修改项目配置文件 (默认为 `koot.config.js`) 中的如下配置项，如不存在则在配置对象内追加：
    - `type` -> `"react-spa"`
    - `target` -> `"electron"`

完成以上步骤后，`koot-dev` `koot-build` `koot-start` 命令会自动适配 _Electron_ 开发环境：

-   `koot-dev` 完成初次的 SPA 打包后，自动开启 _Electron_ 窗口。如果不慎关闭了 _Electron_ 窗口，可触发一次热更新，窗口会自动恢复
-   `koot-build` 完成 SPA 打包后，会询问是否打包为可执行文件
-   `koot-start` 完成 SPA 打包后，自动开启 _Electron_ 窗口

---

### 相关配置项

除了 `target: 'electron'` 外，还可以通过名为 `electron` 的配置项进行深入定制

```javascript
// Koot.js App 配置文件
module.exports = {
    // 默认值
    electron: {
        main: 'koot-electron/main.js',
        mainOutput: 'main.js',
    },

    // 详细配置。配置项及其说明详见下表
    electron: {
        [option]: 'value',
    },
};
```

**`electron` 选项**

| 项名         | 值类型   | 默认值                  | 解释                                                                                                                      |
| ------------ | -------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `main`       | `string` | `koot-electron/main.js` | _Electron_ 主文件/启动脚本的源文件的路径。配置时建议提供绝对路径                                                          |
| `mainOutput` | `string` | `main.js`               | 打包后的 _Electron_ 主文件/启动脚本的文件路径。请提供相对路径，相对于打包目录                                             |
| `build`      | `Object` | _undefined_             | `electron-builder` 的配置。详情请查阅 [Electron Builder 官方文档](https://www.electron.build/configuration/configuration) |

---

### 主文件

通过上述配置，可以修改 _Electron_ 主文件脚本。该文件会经过 _Webpack_ 打包、转译，最终输出到打包目录中。

除了可以完全的自行编写启动脚本外，`koot-electron` 包中也提供了一些函数以供使用。

```TypeScript
/**
 * 创建浏览器窗口，自动适配 _Koot.js_ 生产环境和开发环境，并有如下默认值
 * - 窗口起始尺寸为主显示器分辨率的 80%
 * - `webPreferences.nodeIntegration` 设为 true
 */
export function createWindow(
    options?: Electron.BrowserWindowConstructorOptions
): Electron.BrowserWindow;
```

---

### 开发注意事项

-   _Electron_ 项目必须为 SPA 模式
-   默认使用 `electron-builder` 进行可执行文件的打包
-   可在 _Koot.js_ 配置文件中添加 `icon` 属性，在打包可执行文件时会使用设定的图标文件 (详见 [项目配置/icon](/config?id=icon))
