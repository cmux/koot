/**
 * AJAX请求
 * @module @utils/request
 */

import axios from 'axios'
// import { store } from 'koot'
import getPort from 'koot/utils/get-port'
// import { resetLogin } from '@api/user'

const apiBase = (() => {
    if (__QA__ && __SERVER__) return `http://127.0.0.1:${getPort()}/`
    if (__DEV__ && __SERVER__) return `http://127.0.0.1:${getPort()}/`
    if (__SERVER__) return `http://127.0.0.1:${getPort()}/`
    return '/'
})()

const request = (settings = {}) => new Promise((resolve, reject) => {
    const optionsNeed = [
        'url', 'method'
    ]
    if (optionsNeed.some(option => {
        if (typeof settings[option] === 'undefined') {
            reject(new Error(`missing option: ${option}`))
            return true
        }
    })) return

    const appendQueryToUrl = settings.method.toLowerCase() === 'get'
    settings.url = getUrl(
        settings.url,
        appendQueryToUrl
            ? (settings.data || settings.query)
            : undefined
    )
    if (appendQueryToUrl) {
        delete settings.data
        delete settings.query
    }

    if (__DEV__) console.log('即将请求', settings)

    axios(settings)
        .then(res => {
            if (typeof res !== 'object') return reject(new Error('REQUEST_FAIL:UNKNOWN'))
            if (res.status != 200) return reject(new Error(`REQUEST_FAIL:STATUS:${res.status}`))
            if (res.statusText != 'OK') return reject(new Error(`REQUEST_FAIL:${res.statusText}`))
            if (typeof res.data !== 'object') return reject(new Error(`REQUEST_FAIL:NO_DATA`))

            return resolve(res.data)
        })
        .catch(err => reject({
            error: err,
            axiosSettings: settings,
        }))
})

/**
 * 生成完整的 API 请求 URL
 * @param {String} api API 地址
 * @param {Object} [query] 附加在 URL 后的参数字段
 * @returns {String} 完整的 URL 地址
 */
export const getUrl = (api, query = {}) => {
    if (!api.includes('://'))
        api = apiBase + (api.substr(0, 1) === '/' ? api.substr(1) : api)

    const defaults = {
        ctime: Date.now(),
    }
    // const state = store.getState()
    // if (typeof state.user === 'object' && typeof state.user.token !== 'undefined')
    //     defaults.token = state.user.token

    query = Object.assign(defaults, query)

    api += (api.includes('?') ? '&' : '?')
        + Object.keys(query)
            .filter(key => typeof query[key] !== 'undefined')
            .map(key => `${key}=${encodeURI(query[key])}`)
            .join('&')

    return api
}

/**
 * 发起一个 AJAX 请求
 * @param {Object} settings 请求配置，参照 [axios](https://github.com/axios/axios)
 * @returns {Promise} Axios 请求
 */
export default (settings, ...args) => {
    if (typeof settings === 'string') {
        const url = settings
        settings = args[0] || {}
        settings.url = url
    }

    return request(settings)
        .catch(err => {

            const {
                error = new Error('Request fail'),
                ...infos
            } = err

            Object.assign(error, infos)

            if (__SERVER__) {
                console.error(error)
                throw error
            }

            if (__CLIENT__) {
                console.error(error)
                alert('TODO: CLIENT ERROR HANDLER')
            }
        })
}
