const babel = require('@babel/core');
const plugin = require('../../../packages/koot-webpack/loaders/babel/plugins/react-replace-memo-in-dev');

const examples = {
    test1: `
import React from 'react';
const A = React.memo(() => 'abc');
`,
    test2: `
import React2 from 'react';
const A = React2.memo(() => 'abc');
`,
    test3: `
import React, { memo } from 'react';
const A = memo(() => 'abc');
`,
    test4: `
import React, { memo as memo2 } from 'react';
const A = memo2(() => 'abc');
`,
};

describe('Babel Plugin: react-replace-memo-in-dev', () => {
    for (const [name, codeOriginal] of Object.entries(examples)) {
        it(name, () => {
            const { code } = babel.transform(codeOriginal, {
                plugins: [plugin],
            });
            expect(code).toMatchSnapshot();
        });
    }
});
