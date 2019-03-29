import kootRouter from 'koot-router';
import routerConfig from './config.js';

const router = new kootRouter(routerConfig);

router.beforeEach = (nextState, replace, callback) => {
    // do...
    callback();
};

export default router.reactRouter;
