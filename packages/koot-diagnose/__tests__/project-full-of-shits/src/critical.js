// 全局 CSS
// 打包时会被自动抽取并整合到 extract.all.[hash].css
// 引用方法: 无需引用，会自动注入到模板中
import './global.less';

// Critical 过程
const doCricital = () => {
    if (window && window.__IS_CLITICAL_INITED__) return true;

    // 检查 UA / 客户端环境
    {
        let platform = 'not-specified';
        const iOSversion = () => {
            if (/iP(hone|od|ad)/.test(navigator.platform)) {
                // supports iOS 2.0 and later: <http://bit.ly/TJjs1V>
                var v = navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/);
                return [
                    parseInt(v[1], 10),
                    parseInt(v[2], 10),
                    parseInt(v[3] || 0, 10)
                ];
            }
        };
        if (typeof navigator === 'object') {
            const UA = navigator.userAgent;
            if (/Android|HTC/i.test(UA)) {
                window.isMobile = true;
                platform = 'android';
            } else if (/iPad/i.test(UA)) {
                // iPad
                window.isMobile = true;
                window.isIOS = true;
                platform = 'ios';
            } else if (/iPod|iPhone/i.test(UA)) {
                // iPhone
                window.isMobile = true;
                window.isIOS = true;
                platform = 'ios';
            } else if (/Mobile/i.test(UA) && /Safari/i.test(UA)) {
                // general iOS
                window.isMobile = true;
                window.isIOS = true;
                platform = 'ios';
            }
            if (/UCBrowser/.test(UA)) {
                window.isUC = true;
            }

            const thisIOSversion = iOSversion();
            window.iOSversion = Array.isArray(thisIOSversion)
                ? thisIOSversion[0]
                : undefined;
            if (Array.isArray(thisIOSversion) && thisIOSversion[0] < 10) {
                window.isMobile = true;
                window.isIOS = true;
                window.isOldIOS = true;
            }

            window.isAlipay =
                /AlipayChannelId/.test(UA) ||
                /AlipayDefined/.test(UA) ||
                /AliApp/.test(UA) ||
                /AlipayClient/.test(UA);
            window.isAliPay = window.isAlipay;

            window.isWechat = /MicroMessenger/.test(UA);
            window.isWeChat = window.isWechat;
            window.isWX = window.isWechat;
            window.isWx = window.isWechat;
        }

        // 根据 UA / 客户端环境，<HTML> 添加 class
        if (__DEV__) document.documentElement.classList.add('is-dev');
        if (window.isMobile)
            document.documentElement.classList.add('is-mobile');
        if (platform)
            document.documentElement.classList.add('platform-' + platform);
    }

    // DOM ready 时
    document.addEventListener('DOMContentLoaded', function() {
        // 检查 WebP 支持
        {
            const canUseWebP = () => {
                var elem = document.createElement('canvas');
                if (elem.getContext && elem.getContext('2d')) {
                    // was able or not to get WebP representation
                    return (
                        elem
                            .toDataURL('image/webp')
                            .indexOf('data:image/webp') === 0
                    );
                } else {
                    // very old browser like IE 8, canvas not supported
                    return false;
                }
            };
            // 如果支持 webp，<HTML> 添加 class
            if (canUseWebP()) document.documentElement.classList.add('webp');
        }

        // online / offline
        {
            const doOnline = () => {
                // console.log('online')
                document.documentElement.classList.remove('is-offline');
            };
            const doOffline = () => {
                // console.log('offline')
                document.documentElement.classList.add('is-offline');
            };
            window.addEventListener('online', doOnline);
            window.addEventListener('offline', doOffline);
            if (navigator.onLine === false) doOffline();
        }
    });

    window.__IS_CLITICAL_INITED__ = true;
};

doCricital();
