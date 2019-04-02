import React, { Component } from 'react';
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
            <div className={classnames('main', this.props.className)}>
                <ScrollAnimation data-animation="fadeInLeft">
                    {/* 占位图片 撑开高度 */}
                    <img
                        className="placeholder-img"
                        src={require('@assets/images/slide-1.jpg')}
                        alt="placeholder"
                    />
                    <Swiper {...params}>
                        {config.map((item, index) => {
                            return (
                                <div key={index}>
                                    <img className="slider-img" src={item.src} alt={item.text} />
                                    <ScrollAnimation
                                        className="delay-2s"
                                        data-animation="fadeInLeft"
                                    >
                                        <span>sdfasdfasfs</span>
                                    </ScrollAnimation>
                                </div>
                            );
                        })}
                    </Swiper>
                </ScrollAnimation>
            </div>
        );
    }
}

export default extend({
    styles: require('./styles.module.less'),
})(Slider);
