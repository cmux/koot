import { store, localeId as LocaleId } from '../../';
import { REDUXSTATE, SSRSTATE } from '../../defaults/defines-window';
import { I18N_INIT } from '../action-types';
import setCookie from '../set-cookie';

/**
 * 初始化
 *
 * @param {Object} options
 * @param {string} [options.localeId] 当前语言ID。如过未提供，会尝试从初始 redux store 中查询
 */
export default (o = {}) => {
    if (!__CLIENT__) return;
    let { localeId } = o;

    if (typeof localeId === 'undefined') {
        if (typeof LocaleId !== 'undefined') localeId = LocaleId;
        else if (
            typeof window[SSRSTATE] === 'object' &&
            typeof window[SSRSTATE].localeId !== 'undefined'
        )
            localeId = window[SSRSTATE].localeId;
        else if (
            typeof window[REDUXSTATE] === 'object' &&
            typeof window[REDUXSTATE].localeId !== 'undefined'
        )
            localeId = window[REDUXSTATE].localeId;
    }

    if (typeof localeId === 'undefined') return;

    if (typeof store === 'object' && store.dispatch) {
        store.dispatch({
            type: I18N_INIT,
            localeId: '' + localeId,
        });
    }

    setCookie(localeId);
};
