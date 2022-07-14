import {
    router,
    client,
} from '__KOOT_PROJECT_CONFIG_PORTION_OTHER_CLIENT_PATHNAME__';
// } from '../../../../koot'
import { CLIENT_MOUNT, CLIENT_UNMOUNT } from '../../defaults/defines-window';
import kootMount, { unmount as kootUnmount } from './run';

window[CLIENT_MOUNT] = (args = {}) =>
    kootMount({
        router,
        client,
        ...args,
    });
window[CLIENT_UNMOUNT] = (args = {}) => kootUnmount(args);

export default (process.env.KOOT_BUILD_TARGET === 'qiankun'
    ? () => {}
    : window[CLIENT_MOUNT])();
