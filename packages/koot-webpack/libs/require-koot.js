// const fs = require('fs')
// const path = require('path')

const getKootFile = require('./get-koot-file');

/**
 * 引用 koot 主包中的文件
 * @deprecated
 * @param {String} theModule module 名
 * @returns {*} module
 */
module.exports = theModule => {
    try {
        return require(`koot/${theModule}`);
    } catch (e) {
        let result;
        ['', '.js', '.cjs', '.mjs', '.ts', '.jsx', '.tsx'].some(ext => {
            try {
                result = require(getKootFile(theModule + ext));
                return result;
            } catch (e) {
                return false;
            }
        });
        return result;
    }
};
