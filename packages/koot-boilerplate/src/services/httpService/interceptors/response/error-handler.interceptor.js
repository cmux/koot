import { push } from 'react-router-redux'

/**
 * 拦截器：统一处理 response status !== 200 的情况
 * 
 * @type {Array}
 */
const errorHandlerInterceptor = [
    function(responseData){
        const { code } = responseData;
        switch( code ){
            case 200:
                return responseData;
            case 403:
                Store && Store.dispatch(push('/login'));
                return responseData;
            default:
                return responseData;
        }
    },
    function(error){
        return error;
    }
]

export default errorHandlerInterceptor;
