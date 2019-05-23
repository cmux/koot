#!/usr/bin/env node

const run = async () => {
    if (await require('../steps/check-update')()) return;
    await require('../steps/create')();
};

run().catch(err => {
    console.trace(err);
});
