#!/usr/bin/env node

switch (process.argv0) {
    case 'create': {
        require('./bin/koot-create');
        break;
    }
    case 'upgrade': {
        require('./bin/koot-upgrade');
        break;
    }
    default: {
    }
}
