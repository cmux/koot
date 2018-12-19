import CreateCURDReducer from '../curd-reducer.js';
import CreateCURDAction from '../curd-action.js';
const ReducerObject = CreateCURDReducer('user');
const ActionObject = CreateCURDAction('user');

export default {
    state: {
        userInfo: {},
        list: [],
        getById: {},
        pagination: {
            page: 1,
            pageSize: 10,
        }
    },
    reducers: {
        ...ReducerObject
    },
    actions: {
        ...ActionObject
    }
}