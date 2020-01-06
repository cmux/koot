import { UPDATE_TEST_MODIFY_STATE } from '@constants/action-types';

export const fetchAppName = () => dispatch =>
    dispatch({
        type: UPDATE_TEST_MODIFY_STATE,
        random: Math.random()
    });
