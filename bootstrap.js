// const ignore = "koot-@(cli|boilerplate|boilerplate-*)"
const ignore = 'koot-cli';

const runCmd = async cmd => {
    // print name
    console.log('\n');
    console.log(`\x1b[43m \x1b[0m\x1b[33m ` + cmd + `\x1b[0m`);
    console.log('');

    // spawn
    const chunks = cmd.split(' ');
    await new Promise(resolve => {
        const child = require('child_process').spawn(chunks.shift(), chunks, {
            stdio: 'inherit',
            shell: true
        });
        child.on('close', () => {
            resolve();
        });
    });
};

const run = async () => {
    await runCmd(`lerna clean --yes --ignore "${ignore}"`);
    await runCmd('npm install --no-save');
    await runCmd(`lerna bootstrap --hoist --ignore "${ignore}"`);

    //

    console.log('\n');
    console.log(`\x1b[42m \x1b[0m\x1b[32m Bootstrap complete\x1b[0m`);
    console.log('');
};

run().catch(err => console.error(err));
