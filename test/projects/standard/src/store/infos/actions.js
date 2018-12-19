import {
    SET_DATA_TS,
    RESET_DATA_TS,
} from '@constants/action-types'
import axios from 'axios'
import getPort from 'koot/utils/get-port'

const apiBase = `http://127.0.0.1:${getPort()}`

export const updateServerTimestamp = () => dispatch => {
    console.log((typeof Store === 'undefined' ? `\x1b[31m×\x1b[0m` : `\x1b[32m√\x1b[0m`) + ' Store in [action] updateServerTimestamp')
    return axios({
        url: `${apiBase}/api/json-test`,
        method: 'GET'
    })
        .then(res => {
            if (typeof res !== 'object') throw new Error('REQUEST_FAIL:UNKNOWN')
            if (res.status != 200) throw new Error(`REQUEST_FAIL:STATUS:${res.status}`)
            if (res.statusText != 'OK') throw new Error(`REQUEST_FAIL:${res.statusText}`)
            if (typeof res.data !== 'object') throw new Error(`REQUEST_FAIL:NO_DATA`)

            dispatch({
                type: SET_DATA_TS,
                ts: res.data.current_timestamp
            })
            return res
        })
}

export const resetServerTimestamp = () => dispatch =>
    dispatch({
        type: RESET_DATA_TS,
    })
