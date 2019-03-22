import path from 'path';

const isDev = __CLIENT__ && !/www\.cmcm\.com/.test(window.location.host);
const apiCtx = require.context('./apis', false, /\.js$/);

export default apiCtx.keys().reduce((exports, file) => {
    exports[path.basename(file, '.js')] = enhanced(apiCtx(file));

    return exports;
}, {});

function enhanced(config) {
    const host = isDev ? config.HOST[0] : config.HOST[1];
    const createAPI = API =>
        Object.keys(API).reduce((result, key) => {
            const pathname = API[key];

            result[key] =
                typeof pathname === 'string'
                    ? (...args) => {
                          let index = 0;

                          return (
                              host +
                              pathname.replace(/:[^/]+/gi, match => {
                                  const arg = args[index++];

                                  return arg === undefined ? match : arg;
                              })
                          );
                      }
                    : createAPI(pathname);

            return result;
        }, {});

    return createAPI(config.API);
}
