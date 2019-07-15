import { createStore } from 'koot';
import reducers from './reducers';
import enhancers from './enhancers';

/**
 * 项目自创建 store 的方法函数
 * - 提供创建 store 的方法
 * - 使用 koot 封装的 createStore 方法
 * - 提供的 reducer 是 Object
 * - 提供 enhancer
 */
export default () => createStore(reducers, undefined, enhancers);
