import {
    default as doUpdate,
    getInjectedMetaTags
} from '../React/client-update-page-info';

/**
 * _仅限客户端_
 *
 * 更新页面标题 `<title>` 和 `<meta>` 标签
 * @param {Object} [info={}]
 * @param {string} [info.title] 新的标题。如不提供，则不更新标题
 * @param {Array<Object.<string, string>>} [info.metas] meta 标签信息，需要形式为 `{[name]: value}` 对象的数组。如不提供，则不更新 meta 标签
 * @void
 */
const clientUpdatePageinfo = (info = {}) => {
    if (!__CLIENT__) return;
    let { title, metas } = info;

    if (typeof title === 'undefined') title = document.title;
    if (typeof metas === 'undefined') {
        metas = [...getInjectedMetaTags()].map(el =>
            Object.fromEntries(
                el
                    .getAttributeNames()
                    .map(attr => [attr, el.getAttribute(attr)])
            )
        );
    }

    return doUpdate(title, metas);
};

export default clientUpdatePageinfo;
