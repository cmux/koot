/* eslint-disable no-console */

const log = require('../../log');

module.exports = (msg) => {
    console.log(' ');
    log('error', msg);
    console.log(' ');
    console.log(' ');
};
