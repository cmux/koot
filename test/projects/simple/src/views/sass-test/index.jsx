import React from 'react';
import { extend } from 'koot';

import styles from './styles.component.scss';

const PageSASSTest = extend({
    styles,
    pageinfo: {
        title: 'SASS test'
    }
})(({ className }) => (
    <div className={className} id="__test-sass">
        <span className="normal">NORMAL</span>
        <p className="nested">NESTED</p>
    </div>
));

export default PageSASSTest;
