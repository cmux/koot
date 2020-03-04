global.KOOT_DIST_DIR = __dirname;

const printTitle = title => {
    console.log('\n');
    console.log(`\x1b[43m \x1b[0m` + `\x1b[33m ` + title + `\x1b[0m`);
    console.log('');
};

const spawn = async (cmd, title) => {
    if (title) printTitle(title);

    const chunks = cmd.split(' ');
    await new Promise(resolve => {
        const child = require('child_process').spawn(chunks.shift(), chunks, {
            stdio: 'inherit',
            shell: true,
            cwd: __dirname
        });
        child.on('close', () => {
            resolve();
        });
    });
};

const run = async () => {
    await spawn('npm install --no-save', 'Installing dependencies');

    printTitle('Starting server');
    require('./server');
};

run().catch(err => console.trace(err));
