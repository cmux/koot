import getCwd from '../utils/get-cwd.js';
import emptyTempConfigDir from './empty-temp-config-dir.js';

/**
 * @async
 * 移除所有根目录下的临时项目配置文件
 */
const removeTempProjectConfig = async (
    cwd = getCwd() /*, dist = process.env.KOOT_DIST_DIR*/
) => {
    try {
        emptyTempConfigDir(cwd);
    } catch (e) {}
};

export default removeTempProjectConfig;
