import React from 'react';
import PropTypes from 'prop-types';

import '@assets/css/reset.less';
import '@assets/css/common.less';

class App extends React.Component {

    static propTypes = {
        children: PropTypes.node
    }

    render() {
        const { children } = this.props;
        return children
    }
}






// const App = ({ children }) => children

export default App;
