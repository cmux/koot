import Cookies from 'universal-cookie';
 
const cookiesInstance = new Cookies();

const set = function(key, value){
    return cookiesInstance.set(key, value, {
        path: '/'
    })
}

const get = function(key, cookieString){
    const scopeCookiesInstance = cookieString ? new Cookies(cookieString) : cookiesInstance;
    return scopeCookiesInstance.get(key);
}

export default {
    set,
    get
};
