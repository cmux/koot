const fs = require('fs-extra')
const path = require('path')
const getDistPath = require('../../utils/get-dist-path')

fs.ensureFileSync(path.resolve(getDistPath(), `./server/index.js`))
