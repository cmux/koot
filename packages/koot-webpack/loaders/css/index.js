/**
 * @module koot-css-loader
 */

const postcss = require('postcss');
const loaderUtils = require('loader-utils');
const md5 = require('md5');

const stats = require('./stats');
const replaceSelector = require('./replace-selector');
const {
    classNameHashLength: defaultClassNameHashLength,
} = require('koot/defaults/koot-config');
const postcssTransformDeclUrls = require('../../postcss/transform-decl-urls');

module.exports = function (content) {
    this.cacheable && this.cacheable();

    content = content.replace(/'/g, '"');

    const {
        length = defaultClassNameHashLength,
        mode = 'replace',
        readable = false,
        // prefixToRemove
    } = loaderUtils.getOptions(this);

    const keyword = 'component';

    // md5后，class名字长度
    // 默认5个字符
    // let query = loaderUtils.parseQuery(this.query)

    // replace|wrapper|none
    // replace 是否把样式替换md5值，替换 .page => .c2d3
    // wrapper 是把样式外包一层， .page => .c2d3 .page
    // none 是什么都不做，md5仍然做  .page => .page
    // let mode = query.mode

    // 是否可读
    // true => .name_d3ef
    // false=> .d3ef
    // let readable = query.readable

    // md5 字符串wrapper的class名长度
    // let length = query.length || 5

    // class名字自定义规则
    // TODO: 目前只支持1个规则: .component__[name]__ 其他规则用到的时候再扩展
    // .component => .af2e
    // .component__header__ => .header_af2e
    // let pattern = query.pattern || '.component__[name]__'

    let md5Name = md5(content);
    let customNameMd5 = '';

    // 强制第一位是字母
    const firstChat = md5Name.match(/[a-zA-Z]{1}/)[0];

    // md5 后去掉length-1个字符
    const otherChats = md5Name.substr(0, length - 1);

    // 以字符开通的class名
    md5Name = firstChat + otherChats;

    // 去重
    let flag = true;
    while (flag) {
        flag = !!~stats.collection.indexOf(md5Name);
        if (flag) {
            md5Name += stats.sameIndex + '';
            stats.sameIndex++;
        }
    }

    let customName = '';

    stats.collection.push(md5Name);

    //
    if (mode === 'wrapper') {
        // 暂无实现
    } else if (mode === 'none') {
        // 暂无实现
    } else if (mode === 'replace') {
        // postcss 处理每一个class名字
        const root = postcss.parse(content);
        /** 引用资源列表，会基于这个列表生成顶部的 `import` 代码 */
        const imports = {};
        /** 引用资源 index */
        let importIndex = 0;
        // let once = true // 处理名字只处理1次
        root.walkRules((rule /*, i*/) => {
            // 排除@keyframe
            if (
                rule.parent.type === 'atrule' &&
                rule.parent.name === 'keyframes'
            )
                return;

            rule.selectors = rule.selectors.map((selector) => {
                // 可读性好的class名字
                // eg: .app_3fea
                if (~selector.indexOf(`__${keyword}`)) {
                    // 可读性处理
                    const readablePatten = new RegExp(
                        `.[^ ^+^~^>]+?__${keyword}`
                    );
                    if (readable) {
                        const name = selector.match(readablePatten)[0];

                        // 去下划线前部分
                        customName = name.split('__')[0];

                        // 去掉第一个点
                        if (customName.charAt(0) === '.')
                            customName = customName.replace('.', '');

                        // 可读class名拼接md5字符串
                        customNameMd5 = customName + '_' + md5Name;
                        const patten = new RegExp(name, 'g');
                        const result = selector.replace(
                            patten,
                            '.' + customNameMd5
                        );

                        return result;
                    }

                    // 不可读性处理
                    else {
                        selector = selector.replace(
                            readablePatten,
                            `.${keyword}`
                        );
                        return replaceSelector(selector, md5Name, keyword);
                    }
                }

                // class名字直接用md5值替换，可读性不好，用于压缩
                else if (~selector.indexOf(`.${keyword}`)) {
                    return replaceSelector(selector, md5Name, keyword);
                }

                // 如果上述条件都不满足，在外面加一层 .[hash]
                else {
                    return `.${md5Name} ${selector}`;
                }
            });
        });

        // transformer(root);
        postcssTransformDeclUrls(root, {
            transformer: (url) => {
                // if (prefixToRemove)
                //     result = result.replace(
                //         new RegExp(`^${prefixToRemove}`),
                //         ''
                //     );
                const resName = `__RES${importIndex}`;
                importIndex++;
                imports[resName] = url;
                return `' + ${resName} + '`;
            },
            context: this.context,
            prefixToRemove: this.prefixToRemove,
        });

        // 导出md5的class名字和处理后的css文本
        // 把单引号统一处理成双引号 "" -> ''

        const fileId = customNameMd5 || md5Name;

        let result =
            Object.entries(imports)
                .map(([name, res]) => `import ${name} from "${res}";`)
                .join('\n') +
            '\n' +
            `export const wrapper = '${fileId}';\n` +
            `export const css = '${root.toString()}';\n` +
            `export default { wrapper, css }`;

        // result = result.replace(/\r\n/gi, '').replace(/\n/gi, '')
        result = result
            .replace(
                /(\r\n)|(\n)|(\/\*[\S\s]+?\*\/)|(\/\/)|(\s*;\s*(})\s*)|(\s*([{},;:])\s*)/gi,
                '$6$8'
            )
            .replace(/\s{2,}/gi, ' ');

        return result;
    } else {
        // 暂无实现
    }
};
