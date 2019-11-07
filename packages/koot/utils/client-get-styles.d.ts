interface ReturnedCSS {
    text: string;
    rules: CSSRuleList;
}

/**
 * _[仅客户端]_
 * 获取当前全局 CSS 和所有组件 CSS。返回的对象中包含:
 * - text: CSS 字符串
 * - rules: CSSRuleList
 */
export default function(): {
    _global: ReturnedCSS;
    [moduleId: string]: ReturnedCSS;
};
