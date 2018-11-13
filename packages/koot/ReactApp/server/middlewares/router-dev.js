const fs = require('fs-extra')
const path = require('path')
const router = new require('koa-router')()

const { dll } = require('../../../defaults/dev-request-uri')
const { filenameDll } = require('../../../defaults/before-build')

const dist = process.env.KOOT_DIST_DIR

router.get(dll, (ctx) => {
    const file = path.resolve(dist, filenameDll)
    if (fs.existsSync(file)) {
        ctx.type = 'application/javascript'
        ctx.body = fs.readFileSync(file)
    } else {
        ctx.body = ""
    }
})

export default router.routes()
