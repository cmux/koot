import { UPDATE_TEST_MODIFY_STATE } from '@constants/action-types';
import factory from './initial-state';

const typesCommands = {
    [UPDATE_TEST_MODIFY_STATE]: (state, data) => {
        return data.random;
    }
};

export default function(state = factory(), { type, ...data }) {
    const actionResponse = typesCommands[type];
    return actionResponse ? actionResponse(state, data) : state;
}
