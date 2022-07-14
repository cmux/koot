const babel = require('@babel/core');
const pluginReactClassicImport = require('../../../packages/koot-webpack/loaders/babel/plugins/react-classic-import');

const codeBlock = `
const ttt = 'aaa';
console.log(ttt);
`;
const examples = {
    noImport: `
${codeBlock}
`,
    noImport2: `
let tt;
${codeBlock}
`,
    hasImport: `
import React from 'react';
${codeBlock}
`,
    hasImport2: `
import React, { memo } from 'react';
${codeBlock}
`,
    hasImport3: `
import { memo } from 'react';
${codeBlock}
`,
    hasRequire: `
const React = require('react');
${codeBlock}
`,
    hasRequire2: `
const { memo } = require('react');
${codeBlock}
`,
};

describe('Babel Plugin: react-classic-import', () => {
    for (const [name, codeOriginal] of Object.entries(examples)) {
        it(name, () => {
            const { code } = babel.transform(codeOriginal, {
                plugins: [pluginReactClassicImport],
            });
            expect(code).toMatchSnapshot();
        });
    }
});
