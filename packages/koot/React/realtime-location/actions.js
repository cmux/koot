import { LOCATION_UPDATE } from './actionType'

export function update(location) {
    return {
        type: LOCATION_UPDATE,
        location
    }
}