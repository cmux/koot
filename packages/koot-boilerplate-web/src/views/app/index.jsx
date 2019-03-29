import React, { Component, Fragment } from 'react';
import { extend } from 'koot';
import Header from '@modules/header';
import Footer from '@modules/footer';
import classnames from 'classnames';

// loading
import Preload from '@components/proload';
import Loading from '@components/loading';
// 缓存项目 src/assets/images 目录下的图片资源
// const imgContext = require.context('@assets/images', true, /\.(jpg|png|gif)$/);
// const images = imgContext.keys().map(path => imgContext(path));

class App extends Component {
    render() {
        return (
            <Fragment>
                <Header />
                <div className={classnames('container', this.props.className)}>
                    {this.props.children}
                </div>
                <Footer />
            </Fragment>
            // <Preload images={images} component={Loading}>
            //     {this.props.children}
            // </Preload>
        );
    }
}

export default extend({
    styles: require('./styles.module.less'),
})(App);
