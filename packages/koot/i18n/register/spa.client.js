import { localeId } from '../../'
import { I18N_INIT } from '../action-types'
import { actionLocales } from '../redux'


/**
 * 初始化 (非同构项目)
 * 
 * @param {array|object} arg 可用语言列表(Array) | 语言包内容(object)
 */
export default (arg) => {
    if (Array.isArray(arg)) {
        // setAvailableLocales(arg)
        // setLocaleId(parseLocaleId())

        return {
            type: I18N_INIT,
            localeId: '' + localeId
        }
    } else if (typeof arg === 'object') {
        return actionLocales()
    }
}
