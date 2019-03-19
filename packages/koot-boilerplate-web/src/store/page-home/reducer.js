import {
    PAGE_HOME_SET_COVER_HEIGHT
} from '@constants/action-types'

const initialState = {
    coverHeight: 0
}

export default function (state = initialState, action) {

    switch (action.type) {

        case PAGE_HOME_SET_COVER_HEIGHT: {
            return Object.assign({}, state, {
                coverHeight: action.coverHeight
            })
        }

    }

    return state

}
