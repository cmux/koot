import { LOCATION_UPDATE } from './actionType.js';

export function update(location) {
    return {
        type: LOCATION_UPDATE,
        location,
    };
}
