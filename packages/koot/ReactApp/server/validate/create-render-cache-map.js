import RenderCache from '../render-cache'
import { availableLocaleIds } from '../../../i18n'
// import getLocaleIds from '../../../i18n/get-locale-ids'
// import isI18nEnabled from '../../../i18n/is-enabled'

/**
 * 创建服务器渲染缓存存储空间
 * 
 * Map 的第一级为语种ID，每个语种有独立的空间，非多语言项目为 `` (空String)
 * 
 * @async
 * @param {Object} renderCacheConfig
 * @returns {Map}
 */
const createRenderCacheMap = async (renderCacheConfig = {}) => {
    const renderCache = new Map()

    if (availableLocaleIds.length) {
        availableLocaleIds.forEach(localeId => {
            renderCache.set(localeId, new RenderCache(renderCacheConfig))
        })
    } else {
        renderCache.set('', new RenderCache(renderCacheConfig))
    }

    return renderCache
}

export default createRenderCacheMap
