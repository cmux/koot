export const CHANGE_LANGUAGE = 'CHANGE_LANGUAGE'
export const TELL_CLIENT_URL = 'TELL_CLIENT_URL'

export const SERVER_REDUCER_NAME = 'server'

export const serverReducer = (state = { lang: 'en', origin: '' }, action) => {
    switch (action.type) {
        case CHANGE_LANGUAGE:
            return Object.assign({}, state, {
                lang: action.data
            })
        case TELL_CLIENT_URL:
            return Object.assign({}, state, {
                origin: action.data
            })
        default:
            return state
    }
}