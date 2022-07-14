import { AppThunk, ActionTypes } from '@types';
import { UPDATE_APP_TYPE } from '@constants/action-types';

export const updateAppType = (newAppType: string): AppThunk<ActionTypes> => (
    dispatch
    // getState
) =>
    dispatch({
        type: UPDATE_APP_TYPE,
        payload: newAppType,
    });
