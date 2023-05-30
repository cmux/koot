/* eslint-disable no-console */

import log from '../../log.js';

const logError = (msg) => {
    console.log(' ');
    log('error', msg);
    console.log(' ');
    console.log(' ');
};

export default logError;
