export default async ({ store }) => {
    store.__TEST_BEFORE_PRE_RENDER__ = {
        __TEST__: '__TEST_BEFORE_PRE_RENDER__'
    };
};
