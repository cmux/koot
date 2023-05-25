#!/usr/bin/env node

import stepBefore from '../steps/before.js';

const run = async () => {
    // console.log(123);
    const { needUpdate } = await stepBefore();
    if (needUpdate) return;

    const stepCreate = await import('../steps/create/index.js').then(
        (mod) => mod.default
    );
    if (typeof stepCreate === 'function') return await stepCreate();
    await stepCreate.default();
};

run().catch((err) => {
    // eslint-disable-next-line no-console
    console.trace(err);
    throw err;
});

// export default run;
