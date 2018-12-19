import axios from 'axios';
import baseConfig from './config/base.config.js';
import { requestInterceptors, responseInterceptors } from './interceptors';

const axiosInstance = axios.create(baseConfig);

// 装载所有 request interceptor
requestInterceptors.forEach(item => {
    axiosInstance.interceptors.request.use(...item)
});

// 加载所有 response interceptor
responseInterceptors.forEach(item => {
    axiosInstance.interceptors.response.use(...item);
});

const requestTypeList = ['get', 'put', 'patch', 'post', 'delete', 'options', 'head', 'remove'];

const CancelToken = axios.CancelToken;

const baseService = {};

requestTypeList.forEach(( type ) => {
    baseService[type] = function(url, paramsOrData, config = {}){
        let abort, promise;
        config = Object.assign(config, {
            cancelToken: new CancelToken(function executor( cancelFunction ) {
                // An executor function receives a cancel function as a parameter
                abort = cancelFunction;
            })
        })
        if( ['get', 'remove', 'delete', 'head', 'options'].indexOf(type) != -1 ){
            if( type === 'remove'){
                type = 'delete'
            }
            config = Object.assign(
                config, 
                {
                    params: paramsOrData
                }
            )
            promise = axiosInstance[type](url, config);
        }else{
            promise = axiosInstance[type](url, paramsOrData, config);
        }
        promise.abort = abort;
        return promise;
    }
})

baseService.factory = function( url ){
    const result = new Object();
    requestTypeList.forEach(( type ) => {
        result[type] = function( paramsOrData, config = {} ){
            return baseService[type](url, paramsOrData, config)
        }
    })
    return result;
}

export default baseService;
