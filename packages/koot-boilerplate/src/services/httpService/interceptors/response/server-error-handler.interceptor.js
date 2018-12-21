import axios from 'axios';

/**
 * 拦截器：统一处理 response status !== 200 的情况
 * 
 * @type {Array}
 */
const errorHandlerInterceptor = [
    function(response){
        if( axios.isCancel( response ) ){
            return true;
        }
        let status = response.status;
        switch( status ){
            case 200:
                return response.data;
            default:
                // Message.error( `服务报错，错误码：${status} ！` )
                console.error(`服务报错，错误码：${status} ！`)
                return false;
        }
    },
    function(error){
        let isCancel = axios.isCancel( error );
        if( isCancel ){
            return error;
        }else{
            // Message.error({
            // 	content: `服务报错！\n ${error}`,
            // 	duration: 3
            // })
            console.error(`服务报错！\n ${error}`)
            return error;
        }
    }
]

export default errorHandlerInterceptor;
