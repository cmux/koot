import { localeId } from '../'
import locales from './locales'

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
    const l = JSON.parse(process.env.KOOT_I18N_TYPE) === 'redux' || __SERVER__
        ? locales[localeId]
        : undefined

    args.forEach((value, index) => {
        if (index == args.length - 1 && typeof value === 'object' && !Array.isArray(value)) {
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

    // console.log(localeId)
    // console.log(keys, length, key, l)

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
