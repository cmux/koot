import React from 'react';
import { extend } from 'koot';

import styles from './styles.component.less';

export default extend({
    styles,
})((props) => <div {...props} />);
