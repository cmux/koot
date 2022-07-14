import { extend } from 'koot';

export default extend({
    styles: require('./styles.less'),
    name: 'Main',
})((props) => <div id="main" {...props} />);
