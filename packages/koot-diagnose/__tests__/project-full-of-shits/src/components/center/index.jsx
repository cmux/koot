import React from 'react';
import { extend } from 'koot';

const Center = extend({
    styles: require('./index.module.less')
})(props => <div {...props} />);

export default Center;
