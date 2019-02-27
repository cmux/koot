import {
    PAGE_HOME_SET_COVER_HEIGHT
} from '@constants/action-types'


//


export const set = (value) => (dispatch) => {
    dispatch({
        type: PAGE_HOME_SET_COVER_HEIGHT,
        coverHeight: value,
    })
}
