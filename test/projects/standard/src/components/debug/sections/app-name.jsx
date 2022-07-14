import { extend } from 'koot';

import { fetchAppName } from '@store/koot-test/actions';

import Section from '../section';

const DebugSectionAppName = extend({
    connect: (state) => ({
        appName:
            typeof state.kootTest === 'object' &&
            typeof state.kootTest.app === 'object'
                ? state.kootTest.app.name
                : undefined,
    }),
})(({ appName, dispatch }) => (
    <Section name="app-name">
        {appName ? (
            appName
        ) : (
            <button
                data-button="get-data"
                onClick={() => dispatch(fetchAppName())}
            >
                GET DATA
            </button>
        )}
    </Section>
));

export default DebugSectionAppName;
