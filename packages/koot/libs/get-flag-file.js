import path from 'node:path';
import getDirDev from './get-dir-dev-tmp.js';

const getFlagFile = {
    devBuildingServer: () => path.resolve(getDirDev(), '.building-server'),
};

export default getFlagFile;
