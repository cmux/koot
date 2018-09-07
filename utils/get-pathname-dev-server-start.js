const path = require('path')
const getCwd = require('./get-cwd')

module.exports = (cwd = getCwd()) => path.resolve(cwd, 'logs/dev/.server-start')
