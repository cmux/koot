const fs = require('fs-extra')
const path = require('path')

fs.ensureFileSync(path.resolve(
    process.cwd(),
    global.__SUPER_DIST__,
    `./server/index.js`
))