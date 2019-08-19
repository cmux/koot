import { MetaObject } from '../React/component-extender';

/**
 * _仅限客户端_
 *
 * 更新页面标题 `<title>` 和 `<meta>` 标签
 */
function clientUpdatePageinfo(
    /** 新的标题。如不提供，则不更新标题 */
    title?: string,

    /** meta 标签信息，需要形式为 `{[name]: value}` 对象的数组。如不提供，则不更新 meta 标签 */
    metas?: MetaObject[]
): void;

export default clientUpdatePageinfo;
