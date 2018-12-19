import restfullInterceptor from './restfull.interceptor.js';
import undefinedParamsHandlerInterceptor from './undefined-params-handler.interceptor.js';
import authorizationInterceptor from './authorization.interceptor.js';

export default [
    restfullInterceptor,
    undefinedParamsHandlerInterceptor,
    authorizationInterceptor
]