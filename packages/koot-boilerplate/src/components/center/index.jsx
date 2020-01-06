import React from 'react';
import { extend } from 'koot';

import styles from './index.module.less';

const Center = extend({
    styles
})(props => <div {...props} />);

export default Center;
