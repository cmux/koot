const program = require('commander');

//

program
    .version(require('./package').version, '-v, --version')
    .usage('[options]')
    .option('--crawler <startURL>', 'Run Crawler, starting with URL startURL.')
    .parse(process.argv);

//

(async () => {
    const { crawler } = program;

    if (crawler) {
        console.log('\n');
        const errors = await require('./cases/crawler')(crawler);
        Object.keys(errors).forEach(type => {
            errors[type].forEach((err, index) => {
                const { message, ...infos } = err;
                errors[type][index] = {
                    message,
                    ...infos
                };
            });
        });
        console.log('\nerrors', errors);
        return;
    }

    program.help();
})();
