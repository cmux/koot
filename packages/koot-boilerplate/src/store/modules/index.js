import { reduxForCreateStore } from 'koot';
import AppModule from './app.module.js';

export default {
    state: {
        // 外部插入的 reducers
        ...reduxForCreateStore.reducers
    },
    reducers: {
        
    },
    actions: {
       
    },
    modules: {
        app: AppModule,
    }
}
