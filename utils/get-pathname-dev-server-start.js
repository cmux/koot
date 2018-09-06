const path = require('path')
const getCwd = require('./get-cwd')

module.exports = () => path.resolve(getCwd(), 'logs/dev/.server-start')
