import {
    LOCALEID,
    REDUXSTATE,
    SSRSTATE,
    SPALOCALEFILEMAP,
} from '../../defaults/defines-window';
import parseLocaleId from '../../i18n/parse-locale-id';
import getLang from '../../i18n/spa/get-lang';

(() => {
    window[LOCALEID] = parseLocaleId(getLang()) || '';
    window[REDUXSTATE] = { localeId: window[LOCALEID] };
    window[SSRSTATE] = {
        localeId: window[LOCALEID],
        locales: undefined,
    };

    // console.warn(window[LOCALEID], window[SPALOCALEFILEMAP]);

    if (typeof window[SPALOCALEFILEMAP] === 'object' && window[LOCALEID]) {
        const fjs = document.getElementsByTagName('script')[0];
        const attrName = 'data-koot-load-locale';
        if (document.querySelector(`script[${attrName}]`)) {
            return;
        }
        const js = document.createElement('script');
        js.setAttribute(attrName, window[LOCALEID]);
        js.setAttribute('defer', '');
        js.onload = function () {
            // console.log('locale file loaded', window[LOCALEID]);
        };
        js.onerror = function (e) {
            console.error(e);
            throw new Error(`Locale file (${window[LOCALEID]}) load fail!`);
        };
        js.src = window[SPALOCALEFILEMAP][window[LOCALEID]];

        // console.warn(window[LOCALEID], js.src, js);

        fjs.parentNode.insertBefore(js, fjs);
    }

    require('../../React/client-run-first');
})();
