#!/usr/bin/env node

const run = async () => {
    const { needUpdate } = await require('../steps/before')();
    if (needUpdate) return;
    await require('../steps/upgrade')({
        needConfirm: true
    });
};

run();
