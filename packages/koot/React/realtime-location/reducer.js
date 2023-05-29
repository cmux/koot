/* eslint-disable import/no-anonymous-default-export */

import { LOCATION_UPDATE } from './actionType.js';

const initialState = {};

export default function (state = initialState, action) {
    switch (action.type) {
        case LOCATION_UPDATE:
            return action.location;
        default: {
        }
    }

    return state;
}
