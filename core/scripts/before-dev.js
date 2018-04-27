const fs = require('fs-extra')
const path = require('path')

fs.ensureFileSync(path.resolve(
    process.cwd(),
    process.env.SUPER_DIST_DIR,
    `./server/index.js`
))
