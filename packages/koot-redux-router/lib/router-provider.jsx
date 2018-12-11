import React, { Component } from 'react';
import PropTypes from 'prop-types';

class RouterProvider {

    constructor(props, context){

        // 绑定 store 订阅事件

        // 绑定 location change 事件
        this.unlisten = props.history.listen(this.locationChangeHandler)
    }

    render() {
        return this.props.children;
    }

    locationChangeHandler = ( ...args ) => {
        console.info('locationChangeHandler', args);
    }
}

export default RouterProvider;
