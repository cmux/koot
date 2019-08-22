import { createStore } from 'koot';

/**
 * @type {Object|Function} 项目使用的 reducer，接受以下格式/形式
 * - reducer 函数
 * - `combineReducer` 返回的函数结果
 * - 类型是 _Object_ 的 reducer 对照表
 */
const appReducer = undefined;

/** @type {Array} 项目使用的 middleware 列表 */
const appMiddlewares = [];
if (__CLIENT__ && __DEV__) appMiddlewares.push(require('redux-logger').default);

/**
 * 创建 Redux store 的方法
 * 原则上支持任何与 `redux` 兼容的 store 对象
 * - 可使用 koot-redux 提供的方法进行封装
 *
 * 本例为 Redux 最基本的写法
 */
export default () => createStore(appReducer, appMiddlewares);
