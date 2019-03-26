import React, { Component } from 'react';
import { extend } from 'koot';
import Swiper from 'react-id-swiper';

const config = [
    {
        text: 'slide1',
    },
    {
        text: 'slide2',
    },
    {
        text: 'slide3',
    },
    {
        text: 'slide4',
    },
];
class Slider extends Component {
    render() {
        const params = {
            loop: true,
        };

        return (
            <div className={this.props.className + ' main'}>
                <Swiper {...params}>
                    {config.map((item, index) => {
                        return <div key={index}>{item.text}</div>;
                    })}
                </Swiper>
            </div>
        );
    }
}

export default extend({
    styles: require('./styles.module.less'),
})(Slider);
