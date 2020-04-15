const fs = require('fs');
const path = require('path');

const getCwd = require('../utils/get-cwd');

// const { version } = require('../package.json')

/**
 * 处理模板内容代码并返回最终结果
 * @param {String} optionTemplate 模板文件路径或模板内容代码
 * @returns {String} 处理后的模板内容代码
 */
const validateTemplate = (optionTemplate) => {
    if (typeof optionTemplate !== 'string')
        throw new Error('validate-template: `template` need to be String');

    let template;
    if (fs.existsSync(optionTemplate)) {
        template = fs.readFileSync(optionTemplate, 'utf-8');
    } else if (optionTemplate.substr(0, 2) === './') {
        template = fs.readFileSync(
            path.resolve(getCwd(), optionTemplate),
            'utf-8'
        );
    } else if (path.isAbsolute(optionTemplate)) {
        template = fs.readFileSync(path.resolve(optionTemplate), 'utf-8');
    }

    {
        // 检查关键 inject 是否存在
        const important = {
            head: {
                append: ['metas', 'styles'],
            },
            body: {
                prepend: ['react'],
                append: ['scripts'],
            },
        };

        Object.keys(important).forEach((tagName) => {
            Object.keys(important[tagName]).forEach((type) => {
                important[tagName][type].forEach((inject) => {
                    const regex = new RegExp(`<%\\W*inject\\.${inject}\\W*%>`);

                    // 存在该注入，跳过
                    if (regex.test(template)) return;

                    const str = (() => {
                        if (inject === 'react')
                            return `<div id="root"><%- inject.${inject} %></div>`;
                        return `<%- inject.${inject} %>`;
                    })();
                    template = template.replace(
                        new RegExp(
                            `<${type == 'append' ? '/' : ''}${tagName}.*?>`
                        ),
                        (match) => {
                            if (type === 'prepend') return `${match}\n${str}`;
                            return `${str}\n${match}`;
                        }
                    );
                });
            });
        });
    }

    // console.log({ template })

    return (
        template +
        `\n<!-- rendered by using koot.js ${process.env.KOOT_VERSION} -->`
    );
};

module.exports = validateTemplate;
