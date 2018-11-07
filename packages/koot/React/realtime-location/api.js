import * as actions from './actions.js'

export const update = (location) => (dispatch) => {
    return dispatch(
        actions.update(location)
    )
}