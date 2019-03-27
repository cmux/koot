import React, { Component, Fragment } from 'react';
import Preload from '@components/proload';
import Loading from '@components/loading';

// 缓存项目 src/assets/images 目录下的图片资源
const imgContext = require.context('@assets/images', true, /\.(jpg|png|gif)$/);

const images = imgContext.keys().map(path => imgContext(path));

class App extends Component {
    render() {
        return (
            // <Fragment>{this.props.children}</Fragment>

            <Preload images={images} component={Loading}>
                {this.props.children}
            </Preload>
        );
    }
}

export default App;
