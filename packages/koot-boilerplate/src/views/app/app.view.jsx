import React, { Component } from 'react';
import PropTypes from 'prop-types';
import '@assets/css/reset.less';
import '@assets/css/common.less';

class App extends Component {

    static propTypes = {
        children: PropTypes.node 
    }

    render() {
        const { children } = this.props;
        return children
    }
}

export default App;
