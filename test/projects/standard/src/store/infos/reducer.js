import { SET_DATA_TS, RESET_DATA_TS } from '@constants/action-types'
import factory from './initial-state'

const typesCommands = {

    [SET_DATA_TS](state, data) {
        return Object.assign({}, state, {
            serverTimestamp: data.ts
        })
    },

    [RESET_DATA_TS]() {
        // console.log('reset')
        return factory()
    }
}

export default function (state = factory(), { type, ...data }) {
    const actionResponse = typesCommands[type]
    return actionResponse ? actionResponse(state, data) : state
}
