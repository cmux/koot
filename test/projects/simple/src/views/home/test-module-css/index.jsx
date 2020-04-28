import React from 'react';
import { extend } from 'koot';

import Button from 'biz-components/components/button';

import styles from './index.module.less';

// Functional Component =======================================================

const ModuleCssTest = extend({
    styles,
})(
    React.memo(({ className }) => {
        return (
            <div className={className}>
                <Button size="large" appearance="solid" id="__test-module_css">
                    TEST
                </Button>
            </div>
        );
    })
);

export default ModuleCssTest;
