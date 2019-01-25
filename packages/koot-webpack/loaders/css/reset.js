const stats = require('./stats')

module.exports = () => {
    stats.sameIndex = 0
    stats.collection = []

    return stats
}
