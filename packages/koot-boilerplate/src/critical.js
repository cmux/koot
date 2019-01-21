// 全局 CSS
// 打包时会被自动抽取并整合到 extract.all.[hash].css
// 引用方法: 无需引用，会自动注入到模板中
import './global.less'

// Critical 过程
const doCricital = () => {

    if (self && self.__IS_CLITICAL_INITED__) return true

    // 检查 UA / 客户端环境
    {
        let platform = 'not-specified'
        const iOSversion = () => {
            if (/iP(hone|od|ad)/.test(navigator.platform)) {
                // supports iOS 2.0 and later: <http://bit.ly/TJjs1V>
                var v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
                return [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)];
            }
        }
        if (typeof navigator === 'object') {
            const UA = navigator.userAgent
            if (/Android|HTC/i.test(UA)) {
                self.isMobile = true
                platform = 'android'
            } else if (/iPad/i.test(UA)) {
                // iPad
                self.isMobile = true
                self.isIOS = true
                platform = 'ios'
            } else if (/iPod|iPhone/i.test(UA)) {
                // iPhone
                self.isMobile = true
                self.isIOS = true
                platform = 'ios'
            } else if (/Mobile/i.test(UA) && /Safari/i.test(UA)) {
                // general iOS
                self.isMobile = true
                self.isIOS = true
                platform = 'ios'
            }
            if (/UCBrowser/.test(UA)) {
                self.isUC = true
            }

            const thisIOSversion = iOSversion()
            self.iOSversion = Array.isArray(thisIOSversion) ? thisIOSversion[0] : undefined
            if (Array.isArray(thisIOSversion) && thisIOSversion[0] < 10) {
                self.isMobile = true
                self.isIOS = true
                self.isOldIOS = true
            }

            self.isAlipay = (
                /AlipayChannelId/.test(UA) ||
                /AlipayDefined/.test(UA) ||
                /AliApp/.test(UA) ||
                /AlipayClient/.test(UA)
            )
            self.isAliPay = self.isAlipay

            self.isWechat = (
                /MicroMessenger/.test(UA)
            )
            self.isWeChat = self.isWechat
            self.isWX = self.isWechat
            self.isWx = self.isWechat
        }

        // 根据 UA / 客户端环境，<HTML> 添加 class
        if (__DEV__)
            document.documentElement.classList.add('is-dev')
        if (self.isMobile)
            document.documentElement.classList.add('is-mobile')
        if (platform)
            document.documentElement.classList.add('platform-' + platform)
    }

    // DOM ready 时
    document.addEventListener("DOMContentLoaded", function () {
        // 检查 WebP 支持
        {
            const canUseWebP = () => {
                var elem = document.createElement('canvas');
                if (elem.getContext && elem.getContext('2d')) {
                    // was able or not to get WebP representation
                    return elem.toDataURL('image/webp').indexOf('data:image/webp') == 0;
                }
                else {
                    // very old browser like IE 8, canvas not supported
                    return false;
                }
            }
            // 如果支持 webp，<HTML> 添加 class
            if (canUseWebP()) document.documentElement.classList.add('webp')
        }

        // online / offline
        {
            const doOnline = () => {
                // console.log('online')
                document.documentElement.classList.remove('is-offline')
            }
            const doOffline = () => {
                // console.log('offline')
                document.documentElement.classList.add('is-offline')
            }
            window.addEventListener('online', doOnline)
            window.addEventListener('offline', doOffline)
            if (navigator.onLine === false) doOffline()
        }

    })

    self.__IS_CLITICAL_INITED__ = true
}

doCricital()
