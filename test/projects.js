const path = require('path')

module.exports = {
    dir: path.resolve(__dirname, '../.projects'),
    commandTestBuild: 'koot-buildtest',
    projects: [
        {
            name: 'koot-boilerplate',
            github: 'cmux/koot-boilerplate'
        }
    ]
}
