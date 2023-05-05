#!/usr/bin/env node
/* eslint-disable no-console */

import createKootApp from 'koot-cli/steps/create/index.js';

const run = async () => {
    if (typeof createKootApp === 'function') return await createKootApp();
    await createKootApp.default();
};

run().catch((err) => {
    console.trace(err);
});
