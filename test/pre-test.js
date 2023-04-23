// const prepareProjects = require('./prepare-projects')
import initAllTestProjects from './projects/init.js';

const run = async () => {
    // await prepareProjects()
    await initAllTestProjects();
};

run();
