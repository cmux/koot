const localStorage = typeof window === 'undefined' ? undefined : window.localStorage;

const UNIQUE_PREFIX = `USER_CENTER_SYSTEM:`;

export const get = (key) => {
    if( !localStorage ){ return null }
    key = `${UNIQUE_PREFIX}${key}`;
    return JSON.parse( localStorage.getItem(key) );
}

export const set = (key, value) => {
    if( !localStorage ){ return null }
    key = `${UNIQUE_PREFIX}${key}`;
    localStorage.setItem(key, JSON.stringify(value));
}

export const remove = (key) => {
    if( !localStorage ){ return null }
    key = `${UNIQUE_PREFIX}${key}`;
    localStorage.remove(key);
}

export const clear = () => {
    if( !localStorage ){ return null }
    localStorage.clear();
}

export default {
    get,
    set,
    remove,
    clear
}