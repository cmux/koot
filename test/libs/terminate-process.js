const doTerminate = require('terminate');

/**
 * 终止进程
 * @async
 * @param {*} pid
 */
const terminate = async pid =>
    new Promise((resolve, reject) => {
        doTerminate(pid, err => {
            if (err) return reject(err);
            resolve();
        });
    });

module.exports = terminate;
