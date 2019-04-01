import React, { Component, Fragment } from 'react';
import { extend } from 'koot';
import Swiper from 'react-id-swiper';
import classnames from 'classnames';
import ScrollAnimation from '@components/scrollAnimation';

const config = [
    {
        text: 'slide1',
        src: require('@assets/images/slide-1.jpg'),
    },
    {
        text: 'slide2',
        src: require('@assets/images/slide-2.jpg'),
    },
    {
        text: 'slide3',
        src: require('@assets/images/slide-1.jpg'),
    },
    {
        text: 'slide4',
        src: require('@assets/images/slide-2.jpg'),
    },
];
class Slider extends Component {
    render() {
        const params = {
            loop: true,
        };

        return (
            <ScrollAnimation data-animation="fadeInLeft">
                <div className={classnames('main', this.props.className)}>
                    {/* 占位图片 撑开高度 */}
                    <img src={require('@assets/images/slide-1.jpg')} alt="" />
                    <Swiper {...params}>
                        {config.map((item, index) => {
                            return (
                                <div key={index}>
                                    <img src={item.src} alt={item.text} />
                                </div>
                            );
                        })}
                    </Swiper>
                </div>
            </ScrollAnimation>
        );
    }
}

export default extend({
    styles: require('./styles.module.less'),
})(Slider);
