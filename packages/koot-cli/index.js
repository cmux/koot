#!/usr/bin/env node
/* eslint-disable no-console */

async function run() {
    switch (process.argv0) {
        case 'create': {
            await import('./bin/koot-create.js');
            break;
        }
        case 'upgrade': {
            await import('./bin/koot-upgrade.js');
            break;
        }
        default: {
        }
    }
}

run().catch(console.trace);
