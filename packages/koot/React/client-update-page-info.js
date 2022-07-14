/**
 * @typedef Pageinfo
 * @type {Object}
 * @property {string} [title] 标题
 * @property {Array<Object.<string, string>>} [metas] meta 标签信息，需要形式为 `{[name]: value}` 对象的数组
 */

// import isEqual from 'lodash/isEqual';

/**
 * 当前已注入的 meta 标签
 * @type {Array<HTMLElement>}
 */
let injectedMetaTags;

// meta 标签区域结尾的 HTML 注释代码
let nodeCommentEnd;

let inited = false;

/** @type {Pageinfo} */
const infoToChange = {
    title: undefined,
    metas: [],
};
let changeTimeout = undefined;

/**
 * _仅限客户端_
 *
 * 更新页面信息
 * @module
 * @param {string} title 新的标题
 * @param {Array<Object.<string, string>>} metas meta 标签信息，需要形式为 `{[name]: value}` 对象的数组
 */
export default (title, metas = []) => {
    if (__SERVER__) return;
    if (!__SPA__ && !inited) {
        setTimeout(() => {
            inited = true;
        });
        return;
    }

    // 判断 & 追加即将修改的内容
    /*
    // 如果新 meta 不存在于已有的 meta 列表，添加
    metas.forEach(metaNew => {
        if (!infoToChange.metas.length) infoToChange.metas.push(metaNew);
        if (
            !infoToChange.metas.every(metaExist => {
                console.log(metaNew, metaExist, isEqual(metaNew, metaExist));
                return isEqual(metaNew, metaExist);
            })
        ) {
            console.log('PUSH');
            infoToChange.metas.push(metaNew);
        }
    });
    */
    // 如果当前没有信息，设为当前信息
    if (
        !infoToChange.title &&
        (!Array.isArray(infoToChange.metas) || !infoToChange.metas.length)
    ) {
        infoToChange.title = title;
        infoToChange.metas = metas;
    }

    if (changeTimeout) return;

    changeTimeout = setTimeout(() => {
        doUpdate();
        infoToChange.title = undefined;
        infoToChange.metas = [];
        changeTimeout = undefined;
    });
};

//

const doUpdate = () => {
    const { title, metas } = infoToChange;

    // 替换页面标题
    if (typeof title !== 'undefined') document.title = title;

    // 替换 metas
    const head = document.getElementsByTagName('head')[0];
    getInjectedMetaTags().forEach((el) => head.removeChild(el));

    injectedMetaTags.forEach((el) => {
        if (el && el.parentNode) el.parentNode.removeChild(el);
    });
    injectedMetaTags = metas
        .filter((meta) => typeof meta === 'object')
        .map((meta) => {
            const el = document.createElement('meta');
            for (var key in meta) {
                el.setAttribute(key, meta[key]);
            }
            // el.setAttribute(__KOOT_INJECT_ATTRIBUTE_NAME__, '')
            if (nodeCommentEnd) {
                head.insertBefore(el, nodeCommentEnd);
            } else {
                head.appendChild(el);
            }
            return el;
        });
};

//

/**
 * 获取当前已注入的 meta 标签
 * @returns {Array<HTMLElement>}
 */
export const getInjectedMetaTags = () => {
    if (!Array.isArray(injectedMetaTags)) {
        const head = document.getElementsByTagName('head')[0];

        injectedMetaTags = [];
        // 移除所有在 KOOT_METAS 里的 meta 标签
        // 采用 DOM 操作的初衷：如果使用 innerHTML 的字符串替换方法，浏览器可能会全局重新渲染一次，造成“闪屏”
        const childNodes = head.childNodes;
        let meetStart = false;
        let meetEnd = false;
        let i = 0;
        while (!meetEnd && childNodes[i] instanceof Node) {
            const node = childNodes[i];
            if (node.nodeType === Node.COMMENT_NODE) {
                if (node.nodeValue === __KOOT_INJECT_METAS_START__)
                    meetStart = true;
                if (node.nodeValue === __KOOT_INJECT_METAS_END__) {
                    meetEnd = true;
                    nodeCommentEnd = node;
                }
            } else if (
                meetStart &&
                node.nodeType === Node.ELEMENT_NODE &&
                node.tagName === 'META'
            ) {
                injectedMetaTags.push(node);
            }
            i++;
        }
    }

    return injectedMetaTags;
};

/** _仅针对客户端_ 标记已初始化 */
export const markInited = () => {
    inited = true;
};
