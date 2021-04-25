#!/usr/bin/env node

const createKootApp = require('koot-cli/steps/create');

const run = async () => {
    if (typeof createKootApp === 'function') return await createKootApp();
    await createKootApp.default();
};

run().catch((err) => {
    console.trace(err);
});
