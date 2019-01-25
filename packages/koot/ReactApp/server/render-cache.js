/**
 * @callback cacheGet
 * 缓存检查与吐出方法
 * @param {String} url
 * @return {Boolean|String} 对该 URL 不使用缓存时返回 false，使用时返回缓存结果 String
 */

/**
 * @callback cacheSet
 * 缓存存储方法
 * @param {String} url 
 * @param {String} html 
 */

const defaults = require('../../defaults/render-cache')

/**
 * @class React 同构渲染缓存，基于 URL (开发环境: 禁用缓存)
 */
class KootReactRenderCache {

    /**
     * @param {Object} options 
     * @param {Number} maxAge 缓存存在时间
     * @param {Number} maxCount 最多缓存的 URL 的数量
     * @param {cacheGet} get 自定义缓存检查与吐出方法。存在时, maxAge 和 maxCount 设置将被忽略
     * @param {cacheSet} set 自定义缓存存储方法。存在时, maxAge 和 maxCount 设置将被忽略
     */
    constructor(options = {}) {
        const {
            maxAge = defaults.maxAge,
            maxCount = defaults.maxCount,
        } = options

        this.list = new Map()
        this.cachedUrls = []
        this.maxAge = maxAge
        this.maxCount = maxCount
        this.customGet = options.get
        this.customSet = options.set
    }

    /**
     * 缓存检查与吐出方法
     * @param {String} url
     * @return {Boolean|String} 对该 URL 不使用缓存时返回 false，使用时返回缓存结果 String
     */
    get(url) {
        if (typeof this.customGet === 'function')
            return this.customGet(url)

        // 没有该条结果，直接返回 false
        if (!this.list.has(url))
            return false

        const { html, time } = this.list.get(url)

        // 缓存时间短于设定的最大时间，返回缓存结果
        if (Date.now() - time < this.maxAge) {
            // console.log('')
            // console.log(`cached result: ${url} | ${time} | ${Date.now() - time}`)
            // console.log('')
            return html
        }

        // 否则删除已缓存结果，并返回 false
        this.remove(url)
        return false
    }

    /**
     * 缓存存储方法
     * @param {String} url 
     * @param {String} html 
     */
    set(url, html) {
        if (typeof this.customSet === 'function')
            return this.customSet(url, html)

        // 如果当前已缓存的 URL 数量不少于设定的最大数量
        // 移除已缓存列表里的第一条结果
        if (!this.list.has(url) && this.cachedUrls.length >= this.maxCount) {
            // console.log('')
            // console.log(`cached count out: ${url} | ${this.cachedUrls.length}`)
            // console.log('')
            this.remove(this.cachedUrls[0])
            // console.log('new list', this.cachedUrls)
        }

        // 缓存结果
        this.cachedUrls.push(url)
        this.list.set(url, {
            html,
            time: Date.now()
        })
    }

    /**
     * 删除一条已缓存的条目
     * @param {*} url 
     */
    remove(url) {
        this.list.delete(url)
        this.cachedUrls.splice(this.cachedUrls.indexOf(url), 1)
    }
}

module.exports = KootReactRenderCache
