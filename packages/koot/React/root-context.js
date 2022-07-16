import { createContext } from 'react';

// ============================================================================

const defaultValue = {
    store: undefined,
    history: undefined,
    localeId: undefined,
    locales: {},
    rootProps: {},
};
if (process.env.WEBPACK_BUILD_STAGE === 'server') {
    defaultValue.ctx = undefined;
    defaultValue.styles = {};
}
export const createValue = (value = {}) => ({
    ...defaultValue,
    ...value,
});

// ============================================================================

const RootContext = createContext(createValue());
RootContext.displayName = 'KootRootContext';

export default RootContext;
