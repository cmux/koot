module.exports = {
    name: null, // WebApp 名，如果不提供，会采用 name 属性
    shortName: null, // 短名，通常用于桌面图标的名字
    description: null, // WebApp 描述文字
    themeColor: '#253137', // 移动端浏览器主题颜色、PWA 启动时的背景色
    display: 'standalone', // PWA 启动模式
    orientation: 'portrait', // PWA 显示旋转方向
    scope: '/', // WebApp 路径
    startUrl: '/?utm_source=web_app_manifest', // WebApp 启动时访问的 URL
};
