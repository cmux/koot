// Critical 过程
const doCricital = () => {

    if (self && self.isCriticalInit) return true
    if (__DEV__) console.log('🚨 Initializing: critical process...')

    self.isCriticalInit = true

    // 加载最优先CSS
    require('./critical.g.less')

    // App 初始化失败
    self.onInitError = () => {

    }

    // 检查 UA / 客户端环境
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

    // 根据 UA / 客户端环境 添加基础class
    if (__DEV__)
        document.documentElement.classList.add('is-dev')
    if (self.isMobile)
        document.documentElement.classList.add('is-mobile')
    if (platform)
        document.documentElement.classList.add('platform-' + platform)

    // 检查客户端兼容性，如果需要，载入兼容性扩展脚本
    new Promise(resolve => {
        if (typeof Object.assign !== 'function') {
            if (__DEV__) console.log('🚨 Old browser detected. Importing compatibility extend file(s)...')
            // TODO:
            // self.importJS(
            //     typeof self.__CRITICAL_EXTRA_OLD_IE_FILENAME__ == 'undefined'
            //         ? "/client/critical-extra-old-ie.js"
            //         : self.__CRITICAL_EXTRA_OLD_IE_FILENAME__
            // ).then(() => {
            //     if (__DEV__) console.log('   ✔ Imported!')
            //     resolve()
            // }).catch(() => {
            //     if (__DEV__) console.log('   ❌ Importe failed!')
            //     throw new Error('Importing compatibility extend file(s) failed')
            // })
        } else return resolve()
    })
        .then(() => {
            if (__DEV__) console.log('🚨 Complete: critical process!')
        })
        .catch(err => self.onInitError(err))
    // .then(() => self.importJS(self.__CLIENT_FILENAME__))

    // DOM ready 时
    document.addEventListener("DOMContentLoaded", function () {
        // 检查 WebP 支持
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
        if (canUseWebP()) document.documentElement.classList.add('webp')

        // online / offline
        function doOnline() {
            // console.log('online')
            document.documentElement.classList.remove('is-offline')
        }
        function doOffline() {
            // console.log('offline')
            document.documentElement.classList.add('is-offline')
        }
        window.addEventListener('online', doOnline)
        window.addEventListener('offline', doOffline)
        if (navigator.onLine === false) doOffline()

        // 利用 pointer event 判断当前是否为 hover
        if (window.PointerEvent) {
            // document.documentElement.classList.add('is-hover')
            document.documentElement.addEventListener("pointerenter", (evt) => {
                if (evt.pointerType === 'mouse' || evt.pointerType === 'pen')
                    document.documentElement.classList.add('is-hover')
                else
                    document.documentElement.classList.remove('is-hover')
            });
            document.documentElement.addEventListener("pointerleave", () => {
                document.documentElement.classList.remove('is-hover')
            });
        } else {
            document.documentElement.addEventListener("mouseenter", () => {
                document.documentElement.classList.add('is-hover')
            });
            document.documentElement.addEventListener("mouseleave", () => {
                document.documentElement.classList.remove('is-hover')
            });
        }

    })
}

doCricital()
