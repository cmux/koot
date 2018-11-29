/**
 * 根据输入的 type，返回代码中使用的项目类型的正确值
 * @param {String} type
 * @returns {String}
 */
module.exports = (type) => {
    switch (type.toLowerCase()) {
        case 'isomorphic':
        case 'react':
        case 'react-isomorphic':
        case 'react_isomorphic':
        case 'reactisomorphic':
        case 'reactapp':
        case 'react-app':
        case 'react_app': {
            return 'ReactApp'
        }

        case 'spa':
        case 'react-spa':
        case 'react_spa':
        case 'reactspa': {
            return 'ReactSPA'
        }

        // default:
        //     return process.env.KOOT_PROJECT_TYPE
    }
}
