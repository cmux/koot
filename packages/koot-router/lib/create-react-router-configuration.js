/**
 * 区分是否为 react 组件 或 react 函数组件
 * 
 * @param {*} obj 
 */
const isExtendsReactComponent = ( obj ) => {
    // return Object.getPrototypeOf(obj) === React.Component;
    if( obj.prototype.isReactComponent ){
        return true;
    }
    if( typeof obj === 'function' && obj.length === 1 ){
        return true;
    }
    return false;
}

const routerHandler = ( _router ) => {
    if( !_router ){
        return;
    }

    const result = {};

    const { name, path, component, redirect, children, onEnter, meta } = _router;

    if( name ){
        result.name = name;
    }

    if( path ){
        result.path = path;
    }

    if( meta ){
        result.meta = meta;
    }

    if( component ){
        console.info('isExtendsReactComponent', isExtendsReactComponent(component))
        if( isExtendsReactComponent(component) ){
            result.component = component;
        }else{
            result.getComponent = component
        }
    }

    if( redirect ){
        const onEnterHook = (nextState, replace) => {
            replace(redirect);
        }

        if( !result.indexRoute ){
            result.indexRoute = {
                onEnter: onEnterHook,
            };
        }else{
            result.indexRoute.onEnter = onEnterHook;
        }
    }

    if( onEnter ){
        result.onEnter = onEnter
    }

    if( children && children.length > 0 ){
        const childRoutes = [];
        children.forEach((childrenItem) => {
            if( childrenItem.path === '' ){
                if( !result.indexRoute ){
                    if( isExtendsReactComponent(childrenItem.component) ){
                        result.indexRoute = {
                            component: childrenItem.component
                        }
                    }else{
                        result.indexRoute = {
                            getComponent: childrenItem.component
                        }
                    }
                }else{
                    if( isExtendsReactComponent(childrenItem.component) ){
                        result.indexRoute.component = childrenItem.component
                    }else{
                        result.indexRoute.getComponent = childrenItem.component
                    }
                }
            }else{
                childRoutes.push(
                    routerHandler( childrenItem )
                )
            }
        })
        result.childRoutes = childRoutes;
    }

    return result;
}

const reactRouterConfigHandler = ( _router ) => {
    return _router && routerHandler(_router);
}

export default reactRouterConfigHandler;
