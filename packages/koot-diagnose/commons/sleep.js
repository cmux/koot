module.exports = (timeMS = 1) =>
    new Promise(resolve => setTimeout(resolve, timeMS));
