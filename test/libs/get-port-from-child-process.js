/**
 * 通过检查子进程的输出/日志/log，等待、分析并返回端口号
 * @async
 * @param {Process} child
 * @param {RegExp} regex
 * @returns {Number} port
 */
const waitForPort = async (child, regex = /port.*\[32m([0-9]+)/) =>
    await new Promise(resolve => {
        let port;

        child.stdout.on('data', msg => {
            // console.log(msg)
            try {
                const obj = JSON.parse(msg);
                if (obj['koot-test']) {
                    port = obj.port;
                }
            } catch (e) {}

            if (!port) {
                const matches = regex.exec(msg);
                if (Array.isArray(matches) && matches.length > 1) {
                    port = parseInt(matches[1]);
                }
            }

            if (port) {
                return resolve(port);
            }
        });
    });

module.exports = waitForPort;
