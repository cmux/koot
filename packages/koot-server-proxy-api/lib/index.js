const axios = require('axios')

module.exports = {
    /**
    * 服务端代理转发请求
    * @param {Object} option 参数
    * @returns {对象} 返回请求结果
    */
    serverAjaxProxy: async function(option) {
        if (!option.url) {
            return {
                code: 500,
                data: '',
                msg: 'url不能为空！'
            }
        }
        let axiosRes = null
        if (option.method == 'GET') {
            axiosRes = await axios({
                method: 'GET',
                url: decodeURIComponent(option.url)
            })
        } else if (option.method == 'POST') { // 暂时不支持formdata
            axiosRes = await axios({
                method: 'POST',
                data: option.data,
                url: decodeURIComponent(option.url)
            })
        } else {
            return {
                code: 500,
                data: '',
                msg: '参数错误！'
            }
        }
        if (axiosRes.data.code == 200) {
            return {
                code: 200,
                data: axiosRes.data.data,
                msg: ''
            }
        } else {
            console.log(`request error! code: ${axiosRes.data.code}, msg: ${axiosRes.data.msg}`)
            return {
                code: 500,
                data: '',
                msg: '服务器错误！'
            }
        }
    }
}