/**
 * 功能函数：处理函数
 * 
 * 删除对象中
 * 值 = 'undefined'
 * 值 = undefined
 * 值 = 'null'
 * 值 = null
 * 
 * @param  {[type]} _obj [description]
 * @return {[type]}      [description]
 */
const replaceUndefined = ( _obj ) => {
	if( _obj && Object.prototype.toString.call(_obj) === '[object Object]'){
		const result = Object.assign({}, _obj);
		for( let key in result ){
			if( 
				result[key] === 'undefined' ||
				result[key] === 'null' ||
				result[key] === null || 
				result[key] === undefined  
			){
				delete result[key]
			}
		}
		return result;
	}
	return {};
}

/**
 * 拦截器：无效参数处理
 * 
 * 处理掉 params / data 中无效的参数
 *
 * example: http://www.xxx.com?username=undefined&password=null
 * example: http://www.xxx.com
 * @type {Array}
 */
const undefinedParamsHandlerInterceptor = [
	function( axiosConfig ){
		if( axiosConfig && axiosConfig.params ){
			axiosConfig.params = replaceUndefined( axiosConfig.params );
		}
		if( axiosConfig && axiosConfig.data){
			axiosConfig.data = replaceUndefined( axiosConfig.data );
		}
		return axiosConfig;
	},
	function(error){
		throw error;
	}
]

export default undefinedParamsHandlerInterceptor;
