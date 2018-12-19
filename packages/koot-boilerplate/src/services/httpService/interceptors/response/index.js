import serverErrorHandlerInterceptor from './server-error-handler.interceptor.js';
import errorHandlerInterceptor from './error-handler.interceptor';
import fileHandlerInterceptor from './file-handler.interceptor';

export default [
    fileHandlerInterceptor,
    serverErrorHandlerInterceptor,
    errorHandlerInterceptor,
]