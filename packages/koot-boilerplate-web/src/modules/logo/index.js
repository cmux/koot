import React, { Component } from 'react';
import { extend } from 'koot';
import classnames from 'classnames';
import { Link } from 'react-router';
import LogoImg from '@assets/images/logo.png';

class Logo extends Component {
    render() {
        return (
            <div className={classnames(this.props.className, 'logo-wrap')}>
                <h1 className="logo">
                    <Link to={'/'} rel="noopener noreferrer">
                        <img src={LogoImg} alt="Logo" />
                    </Link>
                </h1>
            </div>
        );
    }
}

export default extend({
    styles: require('./styles.module.less'),
})(Logo);
