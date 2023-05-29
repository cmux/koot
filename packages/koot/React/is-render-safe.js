import { get as getSSRContext } from '../libs/ssr/context.js';
import { needConnectComponents } from '../defaults/defines-server.js';

/**
 * 当前执行和渲染有关的操作是否安全
 * - 客户端: 永远安全
 * - 服务器端: SSR `dataToStore` 之前不安全，之后安全
 * @returns {boolean}
 */
const isRenderSafe = () =>
    !Boolean(__SERVER__ && getSSRContext()[needConnectComponents]);
export default isRenderSafe;
