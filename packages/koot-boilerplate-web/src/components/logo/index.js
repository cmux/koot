import React from 'react';
import { extend } from 'koot';
import { Link } from 'react-router';

class Logo extends React.Component {
    render() {
        return (
            <div className="logo-wrap">
                <Link>cmcm</Link>
            </div>
        );
    }
}

export default extend({
    styles: require('./styles.module.less'),
})(Logo);
