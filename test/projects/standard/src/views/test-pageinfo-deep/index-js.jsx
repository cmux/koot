import { extend } from 'koot';

import styles from './index.module.less';

const ComponentExample = extend({
    pageinfo: (/*state, renderProps*/) => ({
        title: `test-pageinfo-deep - ${__('title')}`,
        metas: [
            { description: 'test-pageinfo-deep' },
            { 'page-name': 'test-pageinfo-deep' },
        ],
    }),
    styles,
})(({ className }) => (
    <div className={className} data-koot-test-page="page-test-pageinfo-deep">
        <A />
    </div>
));

export default ComponentExample;

const A = extend({
    pageinfo: {
        title: 'AAA',
    },
})(() => <div>AAA</div>);
