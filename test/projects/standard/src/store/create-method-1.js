import { createStore } from 'koot';
import reducers from './reducers';

/**
 * 项目自创建 store 的方法函数
 * - 提供创建 store 的方法
 * - 使用封装的 createStore 方法
 * - 提供的 reducer 是 Object
 */
export default () => createStore(reducers);
