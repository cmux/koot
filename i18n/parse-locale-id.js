import parseLanguageList from './parse-language-list'

import {
    availableLocales,
} from './index'

/**
 * 检查单项，如果和availableLocales内的项目有匹配，返回匹配，否则返回null
 * @param {string} input 检查项
 * @returns 匹配的 localeId 或 null
 */
const checkItem = (input) => {
    let id

    input = input.toLowerCase().replace(/_/g, '-')

    availableLocales.some(_localeId => {
        if (_localeId == input)
            id = _localeId
        return id
    })

    const parseSeg = (id, localeId, str) => {
        if (id) return id

        const seg = localeId.split(str)

        if (!id) {
            availableLocales.some(_localeId => {
                if (_localeId == seg[0] + '-' + seg[seg.length - 1])
                    id = _localeId
                return id
            })
        }

        if (!id) {
            availableLocales.some(_localeId => {
                if (_localeId == seg[0])
                    id = _localeId
                return id
            })
        }

        return id || null
    }

    id = parseSeg(id, input, '-')

    return id || null
}

/**
 * 根据输入内容返回availableLocales内匹配的语言包ID(localeId)
 * 如果没有匹配，返回availableLocales的第一项
 * 注：仅为返回，没有赋值操作
 * 
 * @param {string|array} input 
 * 
 * @returns 匹配的语言包ID localeId 或 availableLocales[0]
 */
const parseLocaleId = (input) => {

    // 检查是否包含分号，如果是，按语言列表处理为array
    // eg: zh-CN,zh;q=0.8,en;q=0.6
    if (typeof input === 'string' && input.indexOf(';') > -1)
        input = parseLanguageList(input)

    // 检查是否为array
    if (Array.isArray(input)) {
        let id

        input.some(thisId => {
            id = checkItem(thisId)
            return id
        })

        return id || availableLocales[0]
    }

    else if (!input && typeof navigator !== 'undefined')
        return parseLocaleId(navigator.languages || navigator.language || navigator.browserLanguage || navigator.systemLanguage || navigator.userLanguage || availableLocales[0])

    else if (input)
        return checkItem(input) || availableLocales[0]

    return availableLocales[0]
}

export default parseLocaleId
