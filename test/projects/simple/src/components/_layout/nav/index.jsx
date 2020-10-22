import { extend } from 'koot';

import styles from './styles.component.less';

const Nav = (props) => (
    <div {...props}>
        <h1 className="logo">Koot.js</h1>
    </div>
);

export default extend({
    styles,
})(Nav);
