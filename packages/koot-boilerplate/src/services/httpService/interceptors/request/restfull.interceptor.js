/**
 * 拦截器：restfull api params 处理
 *
 * example: params = { username: 'liudehua', password: '123456' }
 * example: url = http://www.xxx.com/:username/:password
 * example: url = http://www.xxx.com/liudehua/123456
 *
 * example: params = { username: 'liudehua', password: '123456' }
 * example: url = http://www.xxx.com
 * example: url = http://www.xxx.com?username=liudehua&password=123456
 *
 * @type {Array}
 */
const resultfullHandlerInterceptor = [
    function( axiosConfig ){
        let dataType = 'data';
        if( axiosConfig.params ){
            dataType = 'params'
        }
        let params = axiosConfig.params || axiosConfig.data;
        params = Object.assign({}, params);
        let url = axiosConfig.url;
        // 处理 url 中含 resutfull 参数的规则替换
        if( url && url.indexOf('/:') !== -1 && params ){
            Object.keys(params).forEach(( key ) => {
                let patt = new RegExp(`/:${key}`,'g')
                if( url.search(patt) !== -1 ){
                    if( params[key] ){
                        url = url.replace(patt, `/${params[key]}`);
                        delete params[key];
                    }else{
                        url = url.replace(patt, '');
                    }
                }
            })
            // 去掉尾部的 :param 形式
            axiosConfig.url = url.replace(/(\/:){1}(\w)+$/, '');
            axiosConfig[dataType] = params;
        }
        return axiosConfig;
    },
    function( error ){
        throw error;
    }
]

export default resultfullHandlerInterceptor;
