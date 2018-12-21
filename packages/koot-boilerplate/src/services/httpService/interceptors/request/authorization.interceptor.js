// import Store from '@store'
/**
 * 拦截器：给 request Header 统一增加 Header 
 * 
 * header : {
 *     Authorization: token 
 * }
 *
 * @type {Array}
 */
const authorizationInterceptor = [
    ( axiosConfig ) => {
        const userSigninInfo = Store && Store.dispatch('GET_USER_SIGNIN_INFO');
        if( userSigninInfo && userSigninInfo.access_token ){
            axiosConfig.headers.Authorization = userSigninInfo.access_token;
        }
        return axiosConfig;
    },
    ( error ) => {
        throw error;
    }
]

export default authorizationInterceptor;
