import { UPDATE_APP_NAME } from '@constants/action-types';
import factory from './initial-state';

const typesCommands = {
    [UPDATE_APP_NAME]: (state, data) => {
        const stateApp =
            typeof state.app !== 'object' || !Array.isArray(state.app)
                ? {}
                : state.app;
        return {
            ...state,
            app: {
                ...stateApp,
                ...data
            }
        };
    }
};

export default function(state = factory(), { type, ...data }) {
    const actionResponse = typesCommands[type];
    return actionResponse ? actionResponse(state, data) : state;
}
