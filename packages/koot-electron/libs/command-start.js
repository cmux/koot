const path = require('path');
const getCwd = require('koot/utils/get-cwd');

const start = async (dist) => {
    const cwd = getCwd();
    const cmd = `electron ${path.resolve(dist)}`;
    const chunks = cmd.split(' ');
    const child = require('child_process').spawn(chunks.shift(), chunks, {
        stdio: 'inherit',
        shell: true,
        cwd,
    });

    child.on('close', () => {
        try {
            process.kill('SIGINT');
        } catch (e) {}
        process.exit(0);
    });
    child.on('error', (...args) => {
        console.error(...args);
    });

    const exitHandler = (/*options, err*/) => {
        child.kill('SIGINT');
        process.exit(0);
    };

    // do something when app is closing
    process.on('exit', exitHandler);
    // catches ctrl+c event
    process.on('SIGINT', exitHandler);
    // catches "kill pid" (for example: nodemon restart)
    process.on('SIGUSR1', exitHandler);
    process.on('SIGUSR2', exitHandler);
    // catches uncaught exceptions
    process.on('uncaughtException', exitHandler);
};

module.exports = {
    start,
};
