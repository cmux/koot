import parseLocaleId from '../../i18n/parse-locale-id';
import getLang from '../../i18n/spa/get-lang';

(() => {
    window.__KOOT_LOCALEID__ = parseLocaleId(getLang()) || '';
    window.__REDUX_STATE__ = { localeId: window.__KOOT_LOCALEID__ };
    window.__KOOT_SSR_STATE__ = {
        localeId: window.__KOOT_LOCALEID__,
        locales: undefined
    };

    // console.warn(window.__KOOT_LOCALEID__, window.__KOOT_SPA_LOCALE_FILE_MAP__);

    if (
        typeof window.__KOOT_SPA_LOCALE_FILE_MAP__ === 'object' &&
        window.__KOOT_LOCALEID__
    ) {
        const fjs = document.getElementsByTagName('script')[0];
        const attrName = 'data-koot-load-locale';
        if (document.querySelector(`script[${attrName}]`)) {
            return;
        }
        const js = document.createElement('script');
        js.setAttribute(attrName, window.__KOOT_LOCALEID__);
        js.setAttribute('defer', '');
        js.onload = function() {
            // console.log('locale file loaded', window.__KOOT_LOCALEID__);
        };
        js.onerror = function(e) {
            console.error(e);
            throw new Error(
                `Locale file (${window.__KOOT_LOCALEID__}) load fail!`
            );
        };
        js.src = window.__KOOT_SPA_LOCALE_FILE_MAP__[window.__KOOT_LOCALEID__];

        // console.warn(window.__KOOT_LOCALEID__, js.src, js);

        fjs.parentNode.insertBefore(js, fjs);
    }

    require('../../React/client-run-first');
})();
