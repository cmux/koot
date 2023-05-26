import url from 'node:url';
import { fork } from 'node:child_process';

import terminate from '../../utils/terminate.js';

const promptTimeout = async (promptOptions, timeout = 1000) => {
    if (typeof promptOptions !== 'object')
        throw new Error(`Missing parameter: 'promptOptions'`);

    return new Promise((resolve) => {
        const child = fork(
            url.fileURLToPath(new URL('./prompt.js', import.meta.url)),
            [],
            {
                silent: false,
                // stdio: ['pipe', 'pipe', 'pipe', 'ipc']
            }
        );
        child.on('message', (message = {}) => {
            if (typeof message.result !== 'undefined') {
                if (to) clearTimeout(to);
                terminate(child.pid).then(() => {
                    resolve(message.result);
                });
            }
        });

        const to = setTimeout(async () => {
            const defaultValue =
                typeof promptOptions.default !== 'undefined'
                    ? promptOptions.default
                    : Array.isArray(promptOptions.choices)
                    ? typeof promptOptions.choices[0] === 'object'
                        ? promptOptions.choices[0].value
                        : promptOptions.choices[0]
                    : undefined;
            child.send({
                done: defaultValue,
            });
            resolve(defaultValue);
        }, timeout);

        child.send({
            question: {
                ...promptOptions,
                timeout,
            },
        });
    });
};

export default promptTimeout;
