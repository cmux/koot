import React from 'react';
import { extend } from 'koot';

import styles from './index.module.less';

// Functional Component =======================================================

const NoTitleOnlyMetas = extend({
    pageinfo: {
        // title: '页面标题',
        metas: [
            { description: '一个 pageinfo() 没有提供 title 的页面的页面描述' },
        ],
    },
    styles,
})(
    React.memo(
        ({
            className,
            children,
            customProps,
            'data-class-name': classNameModule,
        }) => {
            return (
                <div
                    className={className}
                    data-custom-props={customProps}
                    data-class-name={classNameModule}
                >
                    <p>Hello world!</p>
                    {children}
                </div>
            );
        }
    )
);

export default NoTitleOnlyMetas;
