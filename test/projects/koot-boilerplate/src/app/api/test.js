import {
    SET_DATA_TS,
    RESET_DATA_TS,
} from '@redux/action-types'
import request from '@libs/request'




/**************************************
 * Redux actions
 *************************************/

export const updateTs = () => dispatch =>
    request('/api/json-test', {
        method: 'GET'
    })
        .then(res => {
            dispatch({
                type: SET_DATA_TS,
                ts: res.current_timestamp
            })
            return res
        })

export const resetTs = () => dispatch =>
    dispatch({
        type: RESET_DATA_TS,
    })
