# 接入: Qiankun

---

**编写中……**

```md
基座项目

子项目
安装 koot-qiankun

koot.config.js
target: 'qiankun',
qiankun: {
name: 'xxxx', // 与基座项目（主项目）中注册的子项目的名字一致
basename: 'yyyy', // 为该子项目自动添加的路由前缀
}

`:root` `html` `body` 上的 CSS 转移到自有容器中
尽量不要操作 `window` 对象
```
