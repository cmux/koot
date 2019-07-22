const program = require('commander');
const chalk = require('chalk');

//

program
    .version(require('./package').version, '-v, --version')
    .usage('[options]')
    .option('--crawler <startURL>', 'Run Crawler, starting with URL startURL.')
    .option('--memory <startURL>', 'Run Memory, starting with URL startURL.')
    .parse(process.argv);

//

(async () => {
    const { crawler, memory } = program;

    if (crawler) {
        console.log('');
        const errors = await require('./cases/crawler')(crawler, true);
        console.log('\n' + chalk.bgRedBright(` ERROR `));
        Object.entries(errors).forEach(([type, errors]) => {
            console.log('❌ ' + chalk.underline(type));
            errors.forEach(err => {
                console.log(`● ${err.url}`);
                if (err.pageUrl) console.log(`  pageUrl: ${err.pageUrl}`);
                switch (type) {
                    case 'no gzip':
                    case 'large file': {
                        let size = err.contentLength;
                        if (size > 1024 * 1024) {
                            size =
                                (err.contentLength / 1024 / 1024).toFixed(2) +
                                'MB';
                        } else if (size > 1024) {
                            size = (err.contentLength / 1024).toFixed(2) + 'KB';
                        }
                        console.log(`  contentLength: ${size}`);
                        break;
                    }
                    case 'console error': {
                        console.log(`  ${err.message}`);
                        break;
                    }
                    default: {
                    }
                }
            });
        });
        // Object.keys(errors).forEach(type => {
        //     errors[type].forEach((err, index) => {
        //         const { message, res, type, ...infos } = err;
        //         const r = { ...infos };
        //         if (type === 'console error') r.message = message;
        //         errors[type][index] = r;
        //     });
        // });
        // Object.entries(errors).forEach(([key, value]) => {
        //     console.log(chalk.underline(key));
        //     console.log(JSON.stringify(value, null, 2));
        // });
        console.log('');
        return;
    } else if (memory) {
        console.log('');
        const startTS = Date.now();
        await require('./cases/memory')(memory, 10, true);
        const endTS = Date.now();
        console.log(`Elapsed ${((endTS - startTS) / 1000).toFixed(3)}ms`);
        return;
    }

    program.help();
})();
