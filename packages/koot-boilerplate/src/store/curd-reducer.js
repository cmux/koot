/**
 * @type Reducer funciton
 * @description 全覆盖当前模块的 list & getById
 * 
 * @param {Object}  state    当前局部状态树 
 * @param {Array}   payload  接口返回的数据 LIST
 * 
 * @return 更新当前模块的 list & getById 数据
 */
export const UPDATE_MODULE_LIST = (state, payload) => {
    const isArray = Array.isArray(payload);
    // 如果为非数组
    if( !isArray ){
        return state;
    }
    const nextGetById = {};
    payload.forEach(item => {
        nextGetById[item.id] = item
    })
    return Object.assign({}, state, {
        list: payload,
        getById: nextGetById
    });
}

/**
 * @type Reducer funciton
 * @description 添加当前模块添加单个数据
 * 
 * @param {Object} state    当前局部状态树 
 * @param {Object} payload  单个数据对象
 * 
 * @return 更新当前模块的 list & getById 数据
 */
export const ADD_MODULE_ITEM = (state, payload) => {
    const { list, getById } = state;
    const nextList = [payload].concat(list);
    const nextGetById = Object.assign({}, getById, {
        [payload.id]: payload
    })
    return Object.assign({}, state, {
        list: nextList,
        getById: nextGetById
    });
}

/**
 * @type Reducer funciton
 * @description 更新当前模块添加单个数据
 * 
 * @param {Object} state    当前局部状态树 
 * @param {Object} payload  单个数据对象
 * 
 * @return 更新当前模块的 list & getById 数据
 */
export const UPDATE_MODULE_ITEM = (state, payload) => {
    const { list, getById } = state;
    const { id } = payload;
    getById[id] = payload
    let flag = false;
    let nextList = list.map(item => {
        if( item.id === payload.id ){
            flag = true;
            return payload
        }
        return item;
    })
    if( !flag ){
        nextList = [payload].concat(nextList);
    }
    return Object.assign({}, state, {
        list: nextList,
        getById
    })
}

/**
 * @type Reducer funciton
 * @description 移除当前模块添加单个数据
 * 
 * @param {Object} state    当前局部状态树 
 * @param {Object} payload  单个数据对象
 * 
 * @return 更新当前模块的 list & getById 数据
 */
export const REMOVE_MODULE_ITEM = (state, payload) => {
    const { getById, list } = state;
    const { id } = payload;
    if( getById[id] ){
        delete getById[id]
    }
    const nextList = list.filter(item => {
        return item.id !== payload.id
    })
    return Object.assign({}, state, {
        list: nextList,
        getById
    })
}

/**
 * @type Reducer funciton
 * @description 更新当前模块的分页的单页显示数量
 * 
 * @param {Object} state    当前局部状态树 
 * @param {Object} payload  单个数据对象
 * 
 * @return 更新当前模块的 pagination.pageSize 数据
 */
export const UPDATE_MODULE_PAGE_SIZE = (state, payload) => {
    const pagination = state.pagination;
    pagination.pageSize = payload;
    return Object.assign({}, state, {
        pagination
    })
}

/**
 * @type Reducer funciton
 * @description 更新当前模块的分页的当前页
 * 
 * @param {Object} state    当前局部状态树 
 * @param {Object} payload  单个数据对象
 * 
 * @return 更新当前模块的 pagination.pageIndex 数据
 */
export const UPDATE_MODULE_PAGE_INDEX = (state, payload) => {
    const pagination = state.pagination;
    pagination.pageIndex = payload;
    return Object.assign({}, state, {
        pagination
    })
}

/**
 * @type Reducer funciton
 * @description 覆盖当前模块的分页数据
 * 
 * @param {Object} state    当前局部状态树 
 * @param {Object} payload  单个分页数据对象
 * @param {Number} payload.pageIndex
 * @param {Number} payload.pageSize
 * @param {Number} payload.total
 * 
 * @return 更新当前模块的 page 数据
 */
export const UPDATE_MODULE_PAGE  = (state, payload) => {
    return Object.assign({}, state, {
        pagination: payload
    })
}

/**
 * @type Reducer funciton
 * @description 覆盖当前模块的 filter  数据
 * 
 * @param {Object} state    当前局部状态树 
 * @param {Object} payload  单个分页数据对象
 * 
 * @return 更新当前模块的 page 数据
 */
export const UPDATE_MODULE_FILTER = (state, payload) => {
    return Object.assign({}, state, {
        filter: payload
    })
}

export const UPDATE_MODULE_EXTRA_DATA  = (state, payload) => {
    return Object.assign({}, state, {
        extra: payload
    })
}

const CURDReducers = {
    UPDATE_MODULE_LIST,
    ADD_MODULE_ITEM,
    UPDATE_MODULE_ITEM,
    REMOVE_MODULE_ITEM,
    UPDATE_MODULE_PAGE_SIZE,
    UPDATE_MODULE_PAGE_INDEX,
    UPDATE_MODULE_PAGE,
    UPDATE_MODULE_FILTER,
    UPDATE_MODULE_EXTRA_DATA
}

export default ( nameSpace ) => {
    const reducerNames = Object.keys(CURDReducers);
    const result = {}
    if( nameSpace ){
        reducerNames.forEach(name => {
            nameSpace = nameSpace.toUpperCase();
            const nextName = name.replace('MODULE', nameSpace)
            result[nextName] = CURDReducers[name];
        })
        return result;
    }else{
        return CURDReducers;
    }
}