import { createStore } from 'koot';
import reducers from './reducers';

/**
 * 项目自创建 store 的方法函数
 */
export default () => createStore(reducers);
