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
    componentDidMount() {
        /****************
         * 在需要添加动画的dom上添加className: animation-hide
         * 同时添加 data-scroll-watch属性以及 data-animation="bounce"
         * data-animation值为ainmate.css中对应动画名
         *
         * 如:
         * <div className=" animation-hide delay-2s " data-scroll-watch data-animation='fadeInLeft'></div>
         *
         * ***************/
        if (__CLIENT__) {
            const ScrollWatch = require('ScrollWatch');
            const SW = new ScrollWatch({
                inViewClass: 'animated',
                onElementInView: function(data) {
                    const animationName = data.el.getAttribute('data-animation');
                    data.el.classList.add(animationName);
                },
            });
        }
    }
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
