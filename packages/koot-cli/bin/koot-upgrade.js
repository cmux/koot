#!/usr/bin/env node

import stepBefore from '../steps/before.js';

const run = async () => {
    const { needUpdate } = await stepBefore();
    if (needUpdate) return;
    await import('../steps/upgrade/index.js').then((mod) =>
        mod.default({
            needConfirm: true,
        })
    );
};

run();
