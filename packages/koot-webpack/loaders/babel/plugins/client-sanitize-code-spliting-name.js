const sanitize = require('sanitize-filename');

const chunkNames = [];

module.exports = babel => {
    // const { types: t } = babel;
    return {
        visitor: {
            Import: (path, state) => {
                // const { opts: options, filename } = state;
                // console.log(options, filename);

                /**
                 * 目标: import().then()
                 *
                 * 处理
                 * - 如果引用内容之前有注释，且是 webpackChunkName 设置
                 * - 则转换名称，替换其中的空格和其他非法字符
                 */
                if (
                    path.parent.type === 'CallExpression' &&
                    path.parent.arguments &&
                    path.parent.arguments[0] &&
                    path.parent.arguments[0].type === 'StringLiteral' &&
                    Array.isArray(path.parent.arguments[0].leadingComments)
                ) {
                    path.parent.arguments[0].leadingComments.forEach(
                        comment => {
                            const reg = /^[ ]*webpackChunkName:[ ]*['"](.+?)['"][ ]*$/;
                            const match = reg.exec(comment.value);
                            if (Array.isArray(match)) {
                                let name = sanitize(
                                    match[1]
                                        .replace(/ /g, '_')
                                        .replace(/%/g, '_')
                                );
                                if (chunkNames.includes(name))
                                    name += `_${chunkNames.length}`;
                                comment.value = `webpackChunkName:"${name}"`;
                                chunkNames.push(name);
                                // console.log(match[1]);
                            }
                        }
                    );
                }
            }
        }
    };
};
