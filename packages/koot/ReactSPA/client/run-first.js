import parseLocaleId from '../../i18n/parse-locale-id';
import getLang from '../../i18n/spa/get-lang';

(() => {
    window.__KOOT_LOCALEID__ = parseLocaleId(getLang()) || '';
    window.__REDUX_STATE__ = { localeId: window.__KOOT_LOCALEID__ };
    window.__KOOT_SSR_STATE__ = {
        localeId: window.__KOOT_LOCALEID__,
        locales: {}
    };

    if (
        typeof window.__KOOT_SPA_LOCALE_FILE_MAP__ === 'object' &&
        window.__KOOT_LOCALEID__
    ) {
        const fjs = document.getElementsByTagName('script')[0];
        const id = '__koot-spa-get-locale';
        if (document.getElementById(id)) {
            return;
        }
        const js = document.createElement('script');
        js.id = id;
        js.onload = function() {
            // remote script has loaded
        };
        js.src = window.__KOOT_SPA_LOCALE_FILE_MAP__[window.__KOOT_LOCALEID__];
        fjs.parentNode.insertBefore(js, fjs);
    }

    require('../../React/client-run-first');
})();
