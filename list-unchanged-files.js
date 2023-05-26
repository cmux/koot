import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { glob } from 'glob';

(async () => {
    //
    const modifyTime = new Date('2023-04-23 00:00:00Z+0800');
    const cwd = url.fileURLToPath(new URL('./packages', import.meta.url));
    const files = (
        await glob('**/*.js', {
            cwd,
            dot: true,
            ignore: [
                '**/node_modules/**',
                'playground/**',
                '**/koot-boilerplate*/**',
            ],
        })
    )
        .map((pathname) => path.resolve(cwd, pathname))
        .filter((file) => {
            const { mtime } = fs.lstatSync(file);
            return mtime.valueOf() < modifyTime.valueOf();
        });
    console.log(files);
})();
