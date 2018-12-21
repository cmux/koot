/**
 *  state = {
 *      list: [],
 *      getById: {},
 *      filter: {},
 *      // 额外的外加的数据
 *      extra: {},
 *      pagination: {
 *          page: 1,
 *          pageSize: 10
 *      }
 *  }
 *  
 *  // path from responseData
 *  pathMap = {
 *      list: 'some-path: x.xx.xxx',
 *      item: 'some-path',  
 *      extra: {
 *          key1: 'some-path',
 *          key2: 'some-path'
 *      },
 *      pagination: {
 *          page: 'some-path',
 *          pageSize: 'some-path'
 *      }
 *  }
 */
const isObject = ( data ) => {
    return Object.prototype.toString.call(data) === '[object Object]'
}

const isString = ( data ) => {
    return Object.prototype.toString.call(data) === '[object String]'
}

const getReducerName = (name, nameSpace) => {
    if( nameSpace ){
        return name.replace('MODULE', nameSpace.toUpperCase())
    }
    return name;
}

/**
 * [getDataByPath description]
 * @param  {[type]} obj  [description]
 * @param  {[type]} path [description]
 * @return {[type]}      [description]
 */
const getDataByPath = ( obj, path ) => {
    let result = Object.assign({}, obj);
    for (let index = 0; index < path.length; index++) {
        const p = path[index];
        result = result[p]
        if( !result ){
            return null;
        }
    }
    return result;
}

const getDefaultValue = (type, responseData) => {
    if( type === 'item' ){
        return responseData['data'];
    }
    if( type === 'list' ){
        return responseData['data']['list'];
    }
    if( type === 'pagination' ){
        return responseData['data']['pagination'];
    }
    if( type === 'extra' ){
        return {};
    }
    return responseData;
}

const obejctDeepGetData = (responseData, path) => {
    if( !isObject(path) ){
        return null;
    }
    let resultObject = {};
    const keyList = Object.keys(path);
    keyList.forEach(key => {
        const value = path[key];
        if( isObject(value) ){
            resultObject[key] = obejctDeepGetData(responseData, value);
        }
        if( isString(value) ){
            resultObject[key] = getDataByPath(responseData, value.split('.'));
        }
    })
    return resultObject;
}

const getDataByPathMap = (type, responseData, pathMap) => {
    if( !pathMap || !pathMap[type] ){
        return getDefaultValue(type, responseData)
    }else{
        const path = pathMap[type];
        if( path ){
            let resultItem;
            // 特殊处理 extra: 'auto' 的情况
            if(type === 'extra' && path === 'auto'){
                const listPath = pathMap['list'];
                const listPathList = listPath.split('.');
                const nextListPathList = listPathList.slice(0);
                nextListPathList.pop();
                const listParentItem = getDataByPath(responseData, nextListPathList);
                const keyList = Object.keys(listParentItem);
                if( keyList.length ){
                    resultItem = {};
                    keyList.forEach(key => {
                        if( key !== 'page' && 
                            key !== 'pagination' &&
                            key !== 'list'
                        ){
                            resultItem[key] = listParentItem[key]
                        }
                    })
                }
                return resultItem;
            }
            if(isString(path)){
                const pathList = path.split('.');
                resultItem = getDataByPath(responseData, pathList);
            }
            if(isObject(path)){
                resultItem = obejctDeepGetData(responseData, path);
            }
            if( !resultItem ){
                throw new Error(`can not find value by pathMap ${path}`)
            }else{
                return resultItem;
            }
        }
    }
}
/**
 * @type Action Funciton
 * @description 获取当前模块的单个数据单元，如果 List 中没有，则通过接口获取新的并加入到 LIST 中
 * 
 * @param {Object}          ActionObject        Action 参数对象
 * @param {Object}          payload             单个数据对象
 * @param {Object}          payload.id      
 * @param {Object|Function} serviceOrRequest    Service对象 或者 Request Function
 * @param {String}          nameSpace           命名空间
 * 
 * @return Promise
 */
export const GET_MODULE_ITEM = ({commit}, payload, serviceOrRequest, nameSpace, pathMap) => {
    let promise = null;
    if( typeof serviceOrRequest === 'function' ){
        promise = serviceOrRequest(payload)
    }else if(isObject(serviceOrRequest) && serviceOrRequest.get ){
        promise = serviceOrRequest.get(payload)
    }
    if( promise ){
        promise = promise.then(responseData => {
            if( responseData && responseData.code === 200 ){
                const reducerName = getReducerName('UPDATE_MODULE_ITEM', nameSpace);
                const moduleItemData = getDataByPathMap('item', responseData, pathMap);
                moduleItemData && commit(reducerName, moduleItemData);
            }
            return responseData;
        })
        return promise;
    }
    return Promise.resolve()
}

/**
 * @type Action Funciton
 * @description 获取当前模块的LIST
 * 
 * @param {Object}          ActionObject        Action 参数对象
 * @param {Object}          payload             单个数据对象
 * @param {Object}          payload.id      
 * @param {Object|Function} serviceOrRequest    Service对象 或者 Request Function
 * @param {String}          nameSpace           命名空间
 * 
 * @return Promise
 */
export const GET_MODULE_LIST = ({commit}, payload, serviceOrRequest, nameSpace, pathMap) => {
    const nextParams = Object.assign({}, payload);
    let promise = null;
    if( typeof serviceOrRequest === 'function' ){
        promise = serviceOrRequest(nextParams)
    }else if(isObject(serviceOrRequest) && serviceOrRequest.get ){
        promise = serviceOrRequest.get(nextParams)
    }
    if( promise ){
        return promise.then(responseData => {
            if( responseData && responseData.code === 200 ){
                const updateListReducerName = getReducerName('UPDATE_MODULE_LIST', nameSpace);
                const updatePageReducerName = getReducerName('UPDATE_MODULE_PAGE', nameSpace);

                const moduleListData = getDataByPathMap('list', responseData, pathMap);
                const modulePaginationData = getDataByPathMap('pagination', responseData, pathMap);

                moduleListData && commit(updateListReducerName, moduleListData);
                modulePaginationData && commit(updatePageReducerName, modulePaginationData);
            }
            return responseData;
        })
    }
    return promise;
}

export const GET_MODULE_PAGE_LIST = (
    {commit, state},
    payload,
    serviceOrRequest,
    nameSpace,
    pathMap
) => {
    const { pagination, filter } = state;
    const nextParams = Object.assign({}, pagination, filter, payload);
    let promise = null;
    if( typeof serviceOrRequest === 'function' ){
        promise = serviceOrRequest(nextParams)
    }else if(isObject(serviceOrRequest) && serviceOrRequest.get ){
        promise = serviceOrRequest.get(nextParams)
    }
    if( promise ){
        return promise.then(responseData => {
            if( responseData && responseData.code === 200 ){
                const updateListReducerName = getReducerName('UPDATE_MODULE_LIST', nameSpace);
                const updatePageReducerName = getReducerName('UPDATE_MODULE_PAGE', nameSpace);
                const updateExtraDataReducerName = getReducerName('UPDATE_MODULE_EXTRA_DATA', nameSpace);

                const moduleListData = getDataByPathMap('list', responseData, pathMap);
                const modulePaginationData = getDataByPathMap('pagination', responseData, pathMap);
                const moduleExtraData = getDataByPathMap('extra', responseData, pathMap);

                moduleListData && commit(updateListReducerName, moduleListData);
                modulePaginationData && commit(updatePageReducerName, modulePaginationData);
                moduleExtraData && commit(updateExtraDataReducerName, moduleExtraData);
            }
            return responseData;
        })
    }
    return promise;
}

/**
 * @type Action Funciton
 * @description 新增当前模块的单个数据对象
 * 
 * @param {Object}          ActionObject        Action 参数对象
 * @param {Object}          payload             单个数据对象
 * @param {Object|Function} serviceOrRequest    Service对象 或者 Request Function
 * @param {String}          nameSpace           命名空间
 * 
 * @return Promise
 */
export const ADD_MODULE_ITEM = ({commit}, payload, serviceOrRequest, nameSpace, pathMap) => {
    let promise = null;
    if( typeof serviceOrRequest === 'function' ){
        promise = serviceOrRequest(payload)
    }else if(isObject(serviceOrRequest) && serviceOrRequest.post ){
        promise = serviceOrRequest.post(payload)
    }
    if( promise ){
        return promise.then(responseData => {
            if( responseData && responseData.code === 200 ){
                const reducerName = getReducerName('ADD_MODULE_ITEM', nameSpace);
                const moduleItemData = getDataByPathMap('item', responseData, pathMap);
                moduleItemData && commit(reducerName, moduleItemData);
            }
            return responseData;
        })
    }
    return Promise.resolve();
}

/**
 * @type Action Funciton
 * @description 删除当前模块的单个数据对象
 * 
 * @param {Object}          ActionObject        Action 参数对象
 * @param {Object}          payload             单个数据对象
 * @param {Object|Function} serviceOrRequest    Service对象 或者 Request Function
 * @param {String}          nameSpace           命名空间
 * 
 * @return Promise
 */
export const REMOVE_MODULE_ITEM  = ({commit}, payload, serviceOrRequest, nameSpace, pathMap) => {
    let promise = null;
    if( typeof serviceOrRequest === 'function' ){
        promise = serviceOrRequest(payload)
    }else if(isObject(serviceOrRequest)){
        const request = serviceOrRequest.delete || serviceOrRequest.remove;
        promise = request(payload)
    }
    if( promise ){
        return promise.then(responseData => {
            if( responseData && responseData.code === 200 ){
                const reducerName = getReducerName('REMOVE_MODULE_ITEM', nameSpace);
                const moduleItemData = getDataByPathMap('item', responseData, pathMap);
                moduleItemData && commit(reducerName, moduleItemData);
            }
            return responseData;
        })
    }
    return promise;
}

/**
 * @type Action Funciton
 * @description 更新当前模块的单个数据对象, 如果存在则直接更新，不存在则增加
 * 
 * @param {Object}          ActionObject        Action 参数对象
 * @param {Object}          payload             单个数据对象
 * @param {Object|Function} serviceOrRequest    Service对象 或者 Request Function
 * @param {String}          nameSpace           命名空间
 * 
 * @return Promise
 */
export const UPDATE_MODULE_ITEM  = ({commit}, payload, serviceOrRequest, nameSpace, pathMap) => {
    let promise = null;
    if( typeof serviceOrRequest === 'function' ){
        promise = serviceOrRequest(payload)
    }else if(isObject(serviceOrRequest) && serviceOrRequest.put ){
        promise = serviceOrRequest.put(payload)
    }
    if( promise ){
        return promise.then(responseData => {
            if( responseData && responseData.code === 200 ){
                const reducerName = getReducerName('UPDATE_MODULE_ITEM', nameSpace);
                const moduleItemData = getDataByPathMap('item', responseData, pathMap);
                moduleItemData && commit(reducerName, moduleItemData);
            }
            return responseData;
        })
    }
    return promise;
}

/**
 * @type Action Funciton
 * @description 更新当前模块的 pageSize 数据
 * 
 * @param {Object}          ActionObject        Action 参数对象
 * @param {Object}          payload             pageSize
 * @param {Object|Function} serviceOrRequest    Service对象 或者 Request Function
 * @param {String}          nameSpace           命名空间
 * 
 * @return Promise
 */
export const UPDATE_MODULE_PAGE_SIZE = ({commit}, payload, serviceOrRequest, nameSpace) => {
    const reducerName = getReducerName('UPDATE_MODULE_PAGE_SIZE', nameSpace);
    commit(reducerName, payload);
}

/**
 * @type Action Funciton
 * @description 更新当前模块的 pageIndex 数据
 * 
 * @param {Object}          ActionObject        Action 参数对象
 * @param {Object}          payload             pageIndex
 * @param {Object|Function} serviceOrRequest    Service对象 或者 Request Function
 * @param {String}          nameSpace           命名空间
 * 
 * @return Promise
 */
export const UPDATE_MODULE_PAGE_INDEX = ({commit}, payload, serviceOrRequest, nameSpace) => {
    const reducerName = getReducerName('UPDATE_MODULE_PAGE_INDEX', nameSpace);
    commit(reducerName, payload);
}

/**
 * @type Action Funciton
 * @description 更新当前模块的 searcFilter 数据
 * 
 * @param {Object}          ActionObject        Action 参数对象
 * @param {Object}          payload             pageIndex
 * @param {Object|Function} serviceOrRequest    Service对象 或者 Request Function
 * @param {String}          nameSpace           命名空间
 * 
 * @return Promise
 */
export const UPDATE_MODULE_FILTER  = ({commit}, payload, serviceOrRequest, nameSpace) => {
    const reducerName = getReducerName('UPDATE_MODULE_FILTER', nameSpace);
    commit(reducerName, payload);
}

const CURDActions = {
    GET_MODULE_ITEM,
    GET_MODULE_PAGE_LIST,
    GET_MODULE_LIST,
    ADD_MODULE_ITEM,
    REMOVE_MODULE_ITEM,
    UPDATE_MODULE_ITEM,
    UPDATE_MODULE_PAGE_INDEX,
    UPDATE_MODULE_PAGE_SIZE,
    UPDATE_MODULE_FILTER,
}

export const createCURDAction = (nameSpace, service, pathMap) => {
    const actionNames = Object.keys(CURDActions);
    const result = {}
    if( nameSpace ){
        actionNames.forEach(name => {
            nameSpace = nameSpace.toUpperCase();
            const nextName = name.replace('MODULE', nameSpace)
            result[nextName] = (...args) => {
                return CURDActions[name](...args, service, nameSpace, pathMap)
            };
        })
        return result;
    }else{
        return CURDActions;
    }
}

export default createCURDAction;
