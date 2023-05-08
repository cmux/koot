#!/usr/bin/env node

const run = async () => {
    console.log(123);
    const { needUpdate } = await require('../steps/before')();
    if (needUpdate) return;

    const moduleCreate = require('../steps/create');
    if (typeof moduleCreate === 'function') return await moduleCreate();
    await moduleCreate.default();
};

run().catch((err) => {
    console.trace(err);
});

// export default run;
