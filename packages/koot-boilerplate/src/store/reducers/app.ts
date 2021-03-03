import { AppState, ActionTypes } from '@types';
import { UPDATE_APP_TYPE } from '@constants/action-types';

const initialState: AppState = {
    type: undefined,
};

export default function (state = initialState, action: ActionTypes): AppState {
    const { type, payload } = action;
    switch (type) {
        case UPDATE_APP_TYPE: {
            return {
                ...state,
                type: payload,
            };
        }

        default:
            return state;
    }
}
