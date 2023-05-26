import { typesSPA } from '../../defaults/before-build.js';

/**
 * 判断项目是否为 SPA
 * @param {Object} config
 * @returns {Boolean}
 */
const isSPA = (config) => typesSPA.includes(config.type);
export default isSPA;
