#!/usr/bin/env node

const run = async () => {
    await require('../steps/check-update')()
    await require('../steps/upgrade')({
        needConfirm: true
    })
}

run()
