/* eslint-disable import/no-anonymous-default-export */

import doTerminate from 'terminate';

export default async (pid) =>
    new Promise((resolve, reject) => {
        doTerminate(pid, (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
