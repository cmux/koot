const stats = require('./stats');

module.exports = () => {
    // if (process.env.WEBPACK_BUILD_ENV === 'dev')
    //     console.log('CSS COUNTER RESET');

    stats.sameIndex = 0;
    stats.collection = [];

    return stats;
};
