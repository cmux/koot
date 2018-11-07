#!/usr/bin/env node

const run = async () => {
    await require('../steps/check-update')()
    await require('../steps/create')()
}

run().catch(err => {
    console.trace(err)
})
