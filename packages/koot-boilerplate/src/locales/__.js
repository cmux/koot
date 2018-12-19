export const ZH = 'zh'
export const EN = 'en'

// 当前语音ID
let id = ZH
const locales = {
    [ZH]: require('./zh.json'),
    [EN]: require('./en.json'),
}

export const setLocalId = (localId) => {
    if ([ZH, EN].includes(localId))
        id = localId
}

export const __ = (localKey) => {
    try {
        const current = locales[id]
        let txt = eval(`current.${localKey}`)

        // 如果没有对应内容，返回key本身
        if (!txt) return localKey

        return txt
    } catch (e) {
        return localKey
    }

}

export default __;