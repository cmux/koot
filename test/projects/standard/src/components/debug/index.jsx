import React from 'react';
import { extend } from 'koot';

import SectionAppName from './sections/app-name';

const DebugPanel = extend({
    styles: require('./index.component.less')
})(({ className }) => (
    <div id="koot-debug" className={className}>
        <SectionAppName />
    </div>
));

export default DebugPanel;
