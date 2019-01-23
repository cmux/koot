/**
 * 区分是否为 react 组件 或 react 函数组件
 * 
 * @param {*} obj 
 */
const isExtendsReactComponent = ( obj ) => {
    if( !obj ){
        return false;
    }
    // return Object.getPrototypeOf(obj) === React.Component;
    if( obj.prototype && obj.prototype.isReactComponent ){
        return true;
    }
    if( typeof obj === 'function' && obj.length === 1 ){
        return true;
    }
    return false;
}

/**
 * 
 * @param {*} nextState 
 * @param {*} replace 
 * @param {*} callback 
 * @param {*} options 
 */
const beforeEachHook = (nextState, replace, callback, options = {}) => {
    const { oriOnEnter, beforeEach, afterEach, onUpdate } = options;
    const callbackFunc = () => {
        callback();
        afterEach && typeof afterEach === 'function' && afterEach(nextState)
        onUpdate && typeof onUpdate === 'function' && onUpdate(nextState)
    }
    const nextFunc = () => {
        if( oriOnEnter && typeof oriOnEnter === 'function' ){
            oriOnEnter(nextState, replace, callbackFunc)
        }else{
            callbackFunc();
        }
    }
    if( beforeEach && typeof beforeEach === 'function' ){
        // nextState.router = router;
        beforeEach(nextState, replace, nextFunc)
    }else{
        nextFunc();
    }
}

/**
 * 
 */
const redirectHandler = (nextState, replace, redirect) => {
    let nextRedirect = redirect;
    const { params } = nextState;
    // 支持 redirect/:xxx 的形式
    Object.keys(params).forEach(key => {
        let patt = new RegExp(`/:${key}`,'g')
        if( nextRedirect.search(patt) !== -1 ){
            if( params[key] ){
                nextRedirect = nextRedirect.replace(patt, `/${params[key]}`);
            }
        }
    })
    replace(nextRedirect);
}

const componentEncodeHandler = (obj, component ) => {
    if( !component ){
        return;
    }
    let key = isExtendsReactComponent(component) ? 'component' : 'getComponent';
    obj[key] = component;
}

const nameEncodeHandler = (obj, name) => {
    if( !name ){
        return ;
    }
    obj['name'] = name;
}

const pathEncodeHandler = (obj, path) => {
    obj['path'] = path;
}

const metaEncodeHandler = (obj, meta) => {
    if( !meta ){
        return;
    }
    obj['meta'] = meta;
}

const onEnterEncodeHandler = (obj, options) => {
    const { oriOnEnter, beforeEach, afterEach, onUpdate, redirect, router = {} } = options;
    const { path } = router;
    const onEnterHook = (...args) => {
        const [ nextState, replace ] = args; 
        // console.info('redirect', redirect)
        // console.info('router', router)
        // 重定向
        if( redirect ){
            const { location = {} } = nextState;
            const { pathname } = location;
            // console.info('pathname', pathname)
            if( pathname === path && pathname !== redirect ){
                redirectHandler(nextState, replace, redirect)
            }
        }
        // 如果 path === '' 
        // indexRoute onEnter without callback handler
        if( path === '' ){
            return;
        }
        // 触发 beforeEach
        beforeEachHook(...args, {
            oriOnEnter,
            beforeEach,
            afterEach,
            onUpdate
        })
    }
    obj['onEnter'] = onEnterHook
}

const routerHandler = ( router, beforeEach, afterEach, onUpdate ) => {
    if( !router ){
        return;
    }

    const result = {};
    
    const { name, path, component, redirect, children, onEnter, meta } = router;

    // name
    nameEncodeHandler(result, name);
    // path
    pathEncodeHandler(result, path);
    // meta
    metaEncodeHandler(result, meta);
    // component|getComponent
    componentEncodeHandler(result, component);
    // onEnter
    onEnterEncodeHandler(result, {
        oriOnEnter: onEnter,
        beforeEach,
        afterEach,
        onUpdate,
        redirect,
        path,
        router
    });
    // childrenRoutes
    if( children && children.length > 0 ){
        const childRoutes = [];
        children.forEach((childrenItem) => {
            const { path } = childrenItem;
            if( path === '' ){
                const indexRoute = routerHandler(childrenItem, beforeEach, afterEach);
                const { indexRoute: resultIndexRoute } = result;
                const nextIndexRoute = Object.assign({}, resultIndexRoute, indexRoute)
                result.indexRoute = nextIndexRoute;
            }else{
                childRoutes.push(
                    routerHandler(childrenItem, beforeEach, afterEach)
                )
            }
        })
        result.childRoutes = childRoutes;
    }

    return result;
}

const reactRouterConfigHandler = (router, beforeEach, afterEach, onUpdate) => {
    return router && routerHandler(router, beforeEach, afterEach, onUpdate);
}

export default reactRouterConfigHandler;
