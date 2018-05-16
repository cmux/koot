// import React from 'react'

export const I18N_INIT = 'I18N_INIT'
export const I18N_LOCALES = 'I18N_LOCALES'

// 当前项目可用的语言包代码，与语言包文件名精确匹配
// 注：无论何种环境，在使用任何函数前，需要使用 register() 函数定义/初始化该 Array
export let availableLocales = []
export const setAvailableLocales = arr => availableLocales = arr

// 当前语言包名代码，与语言包文件名精确匹配
export let localeId = null
export const setLocaleId = newLlocalId => {
    if (typeof newLlocalId === 'undefined' || newLlocalId === null)
        return
    if (__DEV__ && __SERVER__)
        console.log(`\n\x1b[93m[super/i18n]\x1b[0m setLocaleId -> \x1b[32m${newLlocalId}\x1b[0m\n`)
    localeId = newLlocalId
    return localeId
}

// 存储文本，按语言包名，如 locales.en、locales['zh-cn']
export let locales = {}
export const setLocales = (locale = localeId, obj) => {
    locales[locale] = obj
}




/**
 * 检查目标语言包ID的语言包内容是否已初始化
 * 
 * @param {*string} theLocaleId 目标语言包ID
 * 
 * @returns {boolean}
 */
export const checkLocalesReady = (theLocaleId = localeId) => {
    return (typeof locales[theLocaleId] !== 'undefined')
}



/**
 * 翻译文本
 * 语言包中源文本中的 ${replaceKey} 表示此处需要替换，replaceKey 就是传入的 obj 中对应的值
 * 
 * @param {string} key 要翻译的文本 Key
 * @param {*object} obj 文本内对应的替换内容
 * 
 * @returns {string} 翻译的文本；如果语言包中没有对应的项，返回 key
 */
const translate = (...args) => {
    let key = ''
    let str
    let options = {}
    const keys = []
    const l = JSON.parse(process.env.SUPER_I18N_TYPE) === 'redux' || __SERVER__
        ? locales[localeId]
        : undefined

    args.forEach((value, index) => {
        if (index == args.length - 1 && typeof value === 'object') {
            options = value
            return
        }
        if (typeof value === 'string' && value.includes('.')) {
            value.split('.').forEach(value => keys.push(value))
            return
        }
        keys.push(value)
    })

    const length = keys.length

    if (typeof keys[0] === 'object') {
        key = keys[0]
        for (let i = 1; i < length; i++) {
            if (typeof key[keys[i]] !== 'undefined')
                key = key[keys[i]]
        }
        if (typeof key === 'object') key = keys[length - 1]
    } else {
        for (let i = 0; i < length; i++) {
            key += (i ? '.' : '') + keys[i]
        }
    }

    // console.log(keys, length, key)

    if (typeof l === 'undefined') {
        str = key
    } else {
        str = (l && typeof l[key] !== 'undefined') ? l[key] : undefined
    }
    // const localeId = _self.curLocaleId

    if (typeof str === 'undefined') {
        try {
            str = eval('l.' + key)
        } catch (e) { }
    }

    if (typeof str === 'undefined') str = key

    if (typeof str === 'string')
        return str.replace(
            /\$\{([^}]+)\}/g,
            (match, p) => typeof options[p] === 'undefined' ? p : options[p]
        )
    else
        return str
}

export default translate
