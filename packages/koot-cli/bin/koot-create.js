#!/usr/bin/env node

const run = async () => {
    const { needUpdate } = await require('../steps/before')();
    if (needUpdate) return;
    await require('../steps/create')();
};

run().catch(err => {
    console.trace(err);
});
