/* global __KOOT_SSR_STATE__:false */

import { store, localeId as LocaleId } from '../../'
import { I18N_INIT } from '../action-types'
import setCookie from '../set-cookie'

/**
 * 初始化
 * 
 * @param {Object} options
 * @param {string} [options.localeId] 当前语言ID。如过未提供，会尝试从初始 redux store 中查询
 */
export default (o = {}) => {
    if (!__CLIENT__) return
    let {
        localeId
    } = o

    if (typeof localeId === 'undefined') {
        if (typeof LocaleId !== 'undefined')
            localeId = LocaleId
        else if (
            typeof __KOOT_SSR_STATE__ === 'object' &&
            typeof __KOOT_SSR_STATE__.localeId !== 'undefined'
        )
            localeId = __KOOT_SSR_STATE__.localeId
        else if (
            typeof __REDUX_STATE__ === 'object' &&
            typeof __REDUX_STATE__.localeId !== 'undefined'
        )
            localeId = __REDUX_STATE__.localeId
    }

    if (typeof localeId === 'undefined')
        return

    if (typeof store === 'object' && store.dispatch) {
        store.dispatch({
            type: I18N_INIT,
            localeId: '' + localeId
        })
    }

    setCookie(localeId)
}
