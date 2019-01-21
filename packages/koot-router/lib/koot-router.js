import CreateReactRouterConfiguration from './create-react-router-configuration.js';

class KootRouter {

    __beforeEachCache = null

    __afterEachCache = null

    __onUpdateCache = null

    __config = {}

    constructor( __config ) {
        this.__config = __config;
    }

    /**
     * 
     */
    // get reactRouter() {
    //     return '暂未实现'
    // }

    /**
     * 
     */
    get reactRouter() {
        const { __config, __beforeEachCache, __afterEachCache, __onUpdateCache } = this;
        return CreateReactRouterConfiguration(__config, __beforeEachCache, __afterEachCache, __onUpdateCache);
    }

    /**
     * 
     */
    get vueRouter() {
        return '啦啦啦啦 ～ 德玛西亚 ~~~'
    }

    beforeEach( callback ) {
        this.__beforeEachCache = callback;
    }

    afterEach( callback ) {
        this.__afterEachCache = callback;
    }

    onUpdate( callback ) {
        this.__onUpdateCache = callback
    }
}

export default KootRouter;
