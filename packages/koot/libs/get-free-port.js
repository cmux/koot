/* eslint-disable import/no-anonymous-default-export */

import portfinder from 'portfinder';

/**
 * 获取可用端口
 * @async
 * @param {Number|Number[]|Object} 正在使用、被占用或保留的端口
 * @returns {Number}
 */
export default async (portUsed) => {
    const portStart = 3000;
    const portEnd = 65535;

    /** @type {Array[]} 使用 portfinder 检查的端口号范围组 */
    const ranges = [[portStart, portEnd]];

    // console.log('portUsed', portUsed)

    /** @type {Number[]} 忽略的端口号 */
    const portsIgnore = [];
    if (isNumber(portUsed)) {
        portsIgnore.push(parseInt(portUsed));
    } else if (Array.isArray(portUsed)) {
        portUsed
            .filter((value) => isNumber(value))
            .forEach((port) => portsIgnore.push(parseInt(port)));
    } else if (typeof portUsed === 'object') {
        Object.values(portUsed)
            .filter((value) => isNumber(value))
            .forEach((port) => portsIgnore.push(parseInt(port)));
    }

    // console.log('portsIgnore', portsIgnore)

    // 如果存在忽略的端口号，修改 ranges 为多组模式
    if (portsIgnore.length) {
        ranges.shift();
        let lastPort = portStart;
        portsIgnore.forEach((port) => {
            ranges.push([lastPort, port - 1]);
            lastPort = port;
        });
    }

    // console.log('ranges', ranges)

    for (const [start, end] of ranges) {
        const result = await getFreePort(start, end);
        // console.log(result)
        if (result) return result;
    }
};

const isNumber = (value) => Boolean(typeof value === 'number' || !isNaN(value));

/**
 * 获取范围内可用的端口
 * @param {Number} start
 * @param {Number} end
 * @returns {Number}
 */
const getFreePort = async (start, end) =>
    portfinder
        .getPortPromise({
            port: start, // minimum port
            stopPort: end, // maximum port
        })
        .then((port) => {
            //
            // `port` is guaranteed to be a free port
            // in this scope.
            //
            return port;
        })
        .catch((/*err*/) => {
            //
            // Could not get a free port, `err` contains the reason.
            //
        });
