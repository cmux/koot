const fs = require('fs-extra')
const path = require('path')

const startJs = `
global.SUPER_DIST_DIR = __dirname;
require('./server');
`
const packageJson = {
    "name": "super-project-server-run",
    "main": "index.js",
    "scripts": {
        "start": "npm i --no-save && node ./index.js"
    },
    "dependencies": {
    }
}

module.exports = async (o = {}) => {
    const {
        dist
    } = o

    const packageProject = await fs.readJson(path.resolve(process.cwd(), 'package.json'))

    await fs.writeFile(
        path.resolve(dist, 'index.js'),
        startJs,
        'utf-8'
    )

    await fs.writeJson(
        path.resolve(dist, 'package.json'),
        Object.assign({}, packageJson, {
            dependencies: packageProject.dependencies
        })
    )
}
