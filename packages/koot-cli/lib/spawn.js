const printTitle = title => {
    console.log('\n');
    console.log(`\x1b[43m \x1b[0m` + `\x1b[33m ` + title + `\x1b[0m`);
    console.log('');
};

const spawn = async (cmd, title, options = {}) => {
    if (typeof title === 'object') return await spawn(cmd, undefined, title);

    if (options.stdio !== 'ignore') printTitle(title || cmd);

    const chunks = cmd.split(' ');
    await new Promise(resolve => {
        const child = require('child_process').spawn(chunks.shift(), chunks, {
            stdio: 'inherit',
            shell: true,
            ...options
        });
        child.on('close', () => {
            resolve();
        });
    });
};

module.exports = spawn;
