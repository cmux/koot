const fs = require('fs-extra');
const path = require('path');
const program = require('commander');
const chalk = require('chalk');
const { parse, stringify } = require('flatted/cjs');

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
    const startTS = Date.now();

    if (crawler) {
        console.log('Running Crawler test...');
        console.log(' ');
        const errors = await require('./crawler')(crawler, {
            debug: true,
            // maxCrawl: 100,
            cluster: {
                maxConcurrency: 5,
                monitor: true
            }
        });
        console.log('\n' + chalk.bgRedBright(` ERROR `));
        const dir = path.resolve(__dirname, '../../logs/crawler/');
        await fs.ensureDir(dir);
        await fs.writeJson(
            path.resolve(dir, `${encodeURIComponent(crawler)}.json`),
            parse(stringify(errors)),
            {
                spaces: '\t'
            }
        );
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
                            size = getSize(size);
                        } else if (size > 1024) {
                            size = getSize(size);
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
    } else if (memory) {
        console.log('Running Memory test for 60s...');
        console.log('');
        const result = await require('./memory')(memory, 60, true);
        result.forEach(r => {
            console.log(`● ${r.prevUrl}`);
            console.log(`⇢ ${r.newUrl}`);
            console.log(`   heap used:  ${getSize(r.JSHeapUsedSize)}`);
            console.log(`   heap total: ${getSize(r.JSHeapTotalSize)}`);
        });
        console.log('');
    }

    const endTS = Date.now();
    console.log(`Elapsed ${((endTS - startTS) / 1000).toFixed(3)}ms`);

    // program.help();
})();

//

const getSize = size => {
    if (size > 1024 * 1024) {
        return (size / 1024 / 1024).toFixed(2) + 'MB';
    } else if (size > 1024) {
        return (size / 1024).toFixed(2) + 'KB';
    }
};
