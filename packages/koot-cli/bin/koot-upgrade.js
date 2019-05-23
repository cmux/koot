#!/usr/bin/env node

const run = async () => {
    if (await require('../steps/check-update')()) return;
    await require('../steps/upgrade')({
        needConfirm: true
    });
};

run();
