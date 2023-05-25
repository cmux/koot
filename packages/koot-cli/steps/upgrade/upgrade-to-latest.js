import fs from 'fs-extra';
import path from 'node:path';
import latestVersion from 'latest-version';
import semver from 'semver';

import spinner from '../../lib/spinner.js';
import msgUpgrading from './msg-upgrading.js';

// eslint-disable-next-line import/no-anonymous-default-export
export default async (dir = process.cwd(), version) => {
    const writeFile = true;

    if (!version) {
        const waitingVersion = spinner('');
        version = await latestVersion('koot');
        waitingVersion.stop();
    }

    const pathnamePackagejson = path.resolve(dir, 'package.json');
    const p = await fs.readJson(pathnamePackagejson);

    const msg = msgUpgrading(
        semver.valid(semver.coerce(p.dependencies.koot)),
        version
    );
    const waiting = spinner(msg + '...');

    // 修改 package.json 的依赖项
    // p.dependencies.koot = '^' + version
    p.dependencies.koot = version;
    if (writeFile)
        await fs.writeJson(pathnamePackagejson, p, {
            spaces: 4,
        });

    waiting.stop();
    spinner(msg).finish();

    // console.log(version)

    return {
        files: [pathnamePackagejson],
    };
};
