import React, { Component } from 'react';
import { extend } from 'koot';
import classnames from 'classnames';
import Swiper from 'react-id-swiper';

class Slider extends Component {
    render() {
        const params = {
            loop: true,
            pagination: {
                el: '.swiper-pagination',
                type: 'bullets',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            spaceBetween: 30,
        };

        return (
            <div className={this.props.className}>
                <Swiper {...params}>
                    <div>Slide 1</div>
                    <div>Slide 2</div>
                    <div>Slide 3</div>
                    <div>Slide 4</div>
                    <div>Slide 5</div>
                </Swiper>
            </div>
        );
    }
}

export default extend({
    styles: require('./styles.module.less'),
})(Slider);
