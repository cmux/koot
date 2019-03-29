import React, { Component, Fragment } from 'react';
import { extend } from 'koot';
import classnames from 'classnames';
import PropTypes from 'prop-types';

/****************
 * 在需要添加动画的dom上添加外层包裹
 * <ScrollAnimation className="delay-1s infinite" data-animation="fadeInLeft"> </ScrollAnimation>
 * data-animation 必填(animate.css中动画名)
 *
 * ***************/
class ScrollAnimation extends Component {
    static propTypes = {
        'data-animation': PropTypes.string.isRequired,
    };
    componentDidMount() {
        this.createAnimation();
    }
    createAnimation = () => {
        if (__CLIENT__) {
            const ScrollWatch = require('ScrollWatch');

            new ScrollWatch({
                inViewClass: 'animated',
                onElementInView: function(data) {
                    const animationName = data.el.getAttribute('data-animation');
                    data.el.classList.add(animationName);
                },
            });
        }
    };
    render() {
        return (
            <div
                className={classnames('srcoll-animation-wrap animation-hide', this.props.className)}
                data-animation={this.props['data-animation'] || 'fadeInLeft'}
                data-scroll-watch
            >
                {this.props.children}
            </div>
        );
    }
}

export default extend({
    styles: require('./styles.module.less'),
})(ScrollAnimation);
