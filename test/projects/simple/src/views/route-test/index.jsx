import React from 'react';
import { extend } from 'koot';

if (__CLIENT__) window.__KOOT_TEST_ROUTE__ = {};

const PageTestRoute = extend({
    connect: (state, ownProps) => {
        if (__CLIENT__) {
            window.__KOOT_TEST_ROUTE__.stateInConnect = state;
            window.__KOOT_TEST_ROUTE__.propsInConnect = ownProps;
        }
        return {
            testId: ownProps.params.testId
        };
    },
    pageinfo: {
        title: 'route test'
    }
})(({ testId, updatePageinfo, ...props }) => {
    if (__CLIENT__) window.__KOOT_TEST_ROUTE__.props = props;
    return (
        <div>
            test id: {testId}
            <p>
                <button
                    id="__test-manually-update-pageinfo"
                    type="button"
                    onClick={() =>
                        updatePageinfo({
                            title: 'TEST ROUTE',
                            metas: [{ 'test-route': 'test-route' }]
                        })
                    }
                >
                    updatePageinfo
                </button>
            </p>
        </div>
    );
});

export default PageTestRoute;
