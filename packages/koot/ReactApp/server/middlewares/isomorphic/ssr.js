import __KOOT_GET_DIST_PATH__ from '../../../../utils/get-dist-path';

const fs = require('fs-extra');
const path = require('path');
// const vm = require('vm')
// const chalk = require('chalk')

/** @type {String} ssr.js 文件内容 */
let __KOOT_SSR_FILE_CONTENT__;

/**
 * 执行服务器端渲染 (Server-Side Rendering)
 */
const ssr = async __KOOT_SSR__ =>
    new Promise(async resolve => {
        __KOOT_SSR__.ssrComplete = result => resolve(result);

        if (__DEV__) {
            return await require('../../ssr')
                .default()
                .catch(err =>
                    resolve({
                        error: err
                    })
                );
        }

        if (!__KOOT_SSR_FILE_CONTENT__) {
            const fileSSR = path.resolve(
                __KOOT_GET_DIST_PATH__(),
                'server/ssr.js'
            );
            if (fs.existsSync(fileSSR)) {
                __KOOT_SSR_FILE_CONTENT__ = fs.readFileSync(fileSSR, 'utf-8');
            } else {
                throw new Error(
                    "No `/server/ssr.js` found. Maybe there's an error while building. Please retry `koot-build`"
                );
            }
        }

        // __KOOT_SSR__.result = false
        // const {
        //     Store,
        //     History,
        //     LocaleId,
        // } = __KOOT_SSR__

        // console.log('before eval', {
        //     LocaleId, logged: __KOOT_SSR__.logged,
        //     'in __KOOT_SSR__': __KOOT_SSR__.LocaleId
        // })

        // console.log('\n' + chalk.cyanBright('eval SSR'))
        // await eval(__KOOT_SSR_FILE_CONTENT__)

        let Store, History, __KOOT_STORE__, __KOOT_HISTORY__;
        const {
            // Store: __KOOT_STORE__,
            // History: __KOOT_HISTORY__,
            LocaleId: __KOOT_LOCALEID__
        } = __KOOT_SSR__;

        const __KOOT_SSR_SET_STORE__ = value => {
            Store = value;
            __KOOT_STORE__ = value;
        };
        const __KOOT_SSR_SET_HISTORY__ = value => {
            History = value;
            __KOOT_HISTORY__ = value;
        };

        try {
            eval(__KOOT_SSR_FILE_CONTENT__);
        } catch (err) {
            resolve({
                error: err
            });
        }
    });

export default ssr;
