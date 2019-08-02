import log from '../../../../../libs/log';

const beforePreRender = async ({ ctx, store, localeId, callback }) => {
    if (__DEV__) log('callback', 'server', 'beforePreRender');
    if (typeof callback === 'function')
        await callback({ ctx, store, localeId });
};

export default beforePreRender;
