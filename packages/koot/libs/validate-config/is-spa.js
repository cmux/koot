const { typesSPA } = require('../../defaults/before-build')

/** 
 * 判断项目是否为 SPA
 * @param {Object} config
 * @returns {Boolean}
 */
module.exports = (config) => typesSPA.includes(config.type)
