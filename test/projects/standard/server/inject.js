export default {
    performanceInfos: () => `<!-- rendered: ${new Date().toISOString()} -->`,
    spaInjectTest: () => {
        if (__SPA__) {
            return (
                `<!--:::KOOT:::TEST:::` +
                require('koot/utils/get-client-file-path')('specialEntry.js') +
                require('koot/utils/read-client-file')('specialEntry.js') +
                `-->`
            );
        }
    },
    testInjectCTX: (template, state, ctx) => (__DEV__ ? '' : ctx.path)
};
