import { combineReducers } from 'redux'

export default class ReduxReducer {

    constructor() {
        this.rootReducer = {}
    }

    use(name, reducer) {

        let extendReducer = {}
        extendReducer[name] = reducer

        Object.assign(this.rootReducer, extendReducer)
        return this.rootReducer
    }

    get() {
        return combineReducers(this.rootReducer)
    }

}