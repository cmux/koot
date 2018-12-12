// import history from "__KOOT_CLIENT_REQUIRE_HISTORY__"
import createHistory from "__KOOT_CLIENT_REQUIRE_CREATE_HISTORY__"
import { parsePath } from 'history/lib/PathUtils'

/**
 * History Enhancer: use basename
 * 
 * Original useBasename enhancer from history also override all read methods
 * `getCurrentLocation` `listenBefore` `listen`
 * But as Diablohu tested, when read methods overrided, if the route matched used async method to get component, would fail
 * that rendering blank page and no route match event fired
 * So we only overrid write methods here. And modify the first level path in routes object to `:localeId`
 * 
 * @param {Function} createHistory
 * @returns {Object} History
 */
const kootUseBasename = (createHistory) =>
    (options = {}) => {
        const history = createHistory(options)
        const { basename } = options

        const addBasename = (location) => {
            if (!location)
                return location

            if (basename && location.basename == null) {
                if (location.pathname.toLowerCase().indexOf(basename.toLowerCase()) === 0) {
                    location.pathname = location.pathname.substring(basename.length)
                    location.basename = basename

                    if (location.pathname === '')
                        location.pathname = '/'
                } else {
                    location.basename = ''
                }
            }

            return location
        }

        const prependBasename = (location) => {
            if (!basename)
                return location

            const object = typeof location === 'string' ? parsePath(location) : location
            const pname = object.pathname
            const normalizedBasename = basename.slice(-1) === '/' ? basename : `${basename}/`
            const normalizedPathname = pname.charAt(0) === '/' ? pname.slice(1) : pname
            const pathname = normalizedBasename + normalizedPathname

            return {
                ...object,
                pathname
            }
        }

        // Override all write methods with basename-aware versions.
        const push = (location) =>
            history.push(prependBasename(location))

        const replace = (location) =>
            history.replace(prependBasename(location))

        const createPath = (location) =>
            history.createPath(prependBasename(location))

        const createHref = (location) =>
            history.createHref(prependBasename(location))

        const createLocation = (location, ...args) =>
            addBasename(history.createLocation(prependBasename(location), ...args))

        return {
            ...history,
            push,
            replace,
            createPath,
            createHref,
            createLocation
        }
    }

let historyClient

const history = (() => {
    if (__CLIENT__) {
        if (!historyClient) {
            const initialState = window.__REDUX_STATE__ || {}
            const historyConfig = { basename: '/' }
            if (JSON.parse(process.env.KOOT_I18N) &&
                process.env.KOOT_I18N_URL_USE === 'router' &&
                initialState.localeId
            ) {
                historyConfig.basename = `/${initialState.localeId}`
                historyClient = kootUseBasename(createHistory)(historyConfig)
            }
            // historyClient = require("__KOOT_CLIENT_REQUIRE_HISTORY__")
            historyClient = createHistory()
        }
        // console.log('historyClient', historyClient)
        return historyClient
    }

    if (__SERVER__) {
        return undefined
    }
})()

export default history
