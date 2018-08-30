import {
    SET_DATA_TS,
    RESET_DATA_TS,
} from '../action-types'

const initialState = {
    ts: undefined,
}

export default function (
    state = initialState,
    { type, ...data }
) {
    switch (type) {

        case SET_DATA_TS: {
            return Object.assign({}, initialState, {
                ts: data.ts
            })
        }

        case RESET_DATA_TS: {
            return Object.assign({}, initialState, {
                ts: initialState.ts
            })
        }

    }

    return state

}
