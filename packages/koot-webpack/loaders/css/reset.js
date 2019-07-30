const stats = require('./stats');

module.exports = () => {
    console.log(stats);

    stats.sameIndex = 0;
    stats.collection = [];

    return stats;
};
