import {
    LOCALEID,
    REDUXSTATE,
    SSRSTATE,
    SPALOCALEFILEMAP,
} from '../../defaults/defines-window';
import parseLocaleId from '../../i18n/parse-locale-id';
import getLang from '../../i18n/spa/get-lang';

(() => {
    let i18nSettings;
    try {
        i18nSettings = JSON.parse(process.env.KOOT_I18N);
    } catch (e) {
        i18nSettings = false;
    }
    // console.log({i18nSettings})

    window[REDUXSTATE] = {};

    // FIX: https://github.com/cmux/koot/issues/230
    if (i18nSettings !== false) {
        window[LOCALEID] = parseLocaleId(getLang()) || '';
        window[REDUXSTATE].localeId = window[LOCALEID];
        // window[SSRSTATE].localeId = window[LOCALEID]
    }

    window[SSRSTATE] = {
        localeId: window[LOCALEID] || '',
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
        // 考虑到项目可能会在运行时修改 __webpack_public_path__
        js.src = [
            !!__webpack_public_path__ &&
            new RegExp(`^${__webpack_public_path__}`).test(
                window[SPALOCALEFILEMAP][window[LOCALEID]]
            )
                ? ''
                : (__webpack_public_path__ || '') +
                  (/\/$/.test(__webpack_public_path__) ? '' : '/'),
            window[SPALOCALEFILEMAP][window[LOCALEID]].replace(/^\//, ''),
        ].join('');

        // console.warn(window[LOCALEID], js.src, js);

        fjs.parentNode.insertBefore(js, fjs);
    }

    require('../../React/client-run-first');
})();
