module.exports = function(server) {
    server.addSubApp('localhost', require('./apps/react'));
    server.addSubApp('qa.cmcm.cn', require('undefined'))
}