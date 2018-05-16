import parseLanguageList from '../parse-language-list'
import getLanguagelistFromState from '../get-language-list-from-state'
import parseLocaleId from '../parse-locale-id'

import {
    I18N_INIT, I18N_LOCALES,
    localeId, locales,
    setLocaleId
} from '../index'

/**
 * Redux reducer: 初始化 localeId
 * 
 * @param {*} state 
 * @param {*} action
 * 
 * @returns {*} state
 */
export const reducerLocaleId = (state = null, action) => {
    switch (action.type) {
        case I18N_INIT:
            return action.localeId
    }
    return state
}


/**
 * Redux reducer: 初始化 locales
 * 
 * @param {*} state 
 * @param {*} action
 * 
 * @returns {*} state
 */
export const reducerLocales = (state = {}, action) => {
    switch (action.type) {
        case I18N_LOCALES:
            return Object.assign({}, state, action.locales)
    }
    return state
}

/**
 * Redux action: 初始化
 * 
 * @param {Object} state 
 * @returns {Object}
 */
export const actionInit = (state) => {
    // setLocaleId(localeId)

    init(parseLanguageList(
        (typeof state === 'object') ? getLanguagelistFromState(state) : state
    ))

    return {
        type: I18N_INIT,
        localeId: '' + localeId
    }
}

/**
 * Redux action: 设置语言包内容对象
 * 
 * @returns {Object}
 */
export const actionLocales = () => {
    return {
        type: I18N_LOCALES,
        locales: locales[localeId]
    }
}

/**
 * 服务器环境：根据语言列表，初始化i18n，获得并赋值 localeId
 * 
 * @param {array|string} langList 语言列表
 * 
 * @returns (如果已初始化)locales[localeId]
 */
const init = (langList = []) => {
    if (__SERVER__) {
        // console.log(locales[localeId])
        if (typeof langList === 'string')
            if (langList.indexOf(';') > -1)
                langList = parseLanguageList(langList)
            else
                return init([langList])

        const parsed = parseLocaleId(langList)
        if (parsed) setLocaleId(parsed)
        // else setLocaleId(localeId)

        if (locales[localeId]) return locales[localeId]
    }
}
