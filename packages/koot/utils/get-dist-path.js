const fs = require('fs');
const path = require('path');
const getCwd = require('./get-cwd');

let p;

/**
 * 获取打包结果路径
 * @returns {String} 打包结果路径 (硬盘绝对路径)
 */
module.exports = () => {
    // console.log('global.KOOT_DIST_DIR', global.KOOT_DIST_DIR)
    if (typeof p !== 'string') {
        p =
            typeof global.KOOT_DIST_DIR === 'string'
                ? global.KOOT_DIST_DIR
                : (() => {
                      let cwd = getCwd();
                      let parent = path.resolve(cwd, '..');
                      let result = path.resolve(cwd, process.env.KOOT_DIST_DIR);
                      while (!fs.existsSync(result) && cwd !== parent) {
                          cwd = parent;
                          parent = path.resolve(cwd, '..');
                          result = path.resolve(cwd, process.env.KOOT_DIST_DIR);
                      }
                      if (fs.existsSync(result)) return result;
                      return path.resolve(cwd, process.env.KOOT_DIST_DIR);
                  })();
    }
    return p;
};
