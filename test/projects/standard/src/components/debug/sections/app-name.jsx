import React from 'react';
import { extend } from 'koot';

import Section from '../section';

const DebugSectionAppName = ({ appName }) => (
    <Section name="app-name">
        {appName ? appName : <button>GET DATA</button>}
    </Section>
);

export default DebugSectionAppName;
