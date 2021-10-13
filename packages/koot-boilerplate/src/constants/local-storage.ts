/**
 * 暗色/亮色模式开关
 * - 当 `localStorage` 中存在该属性时，会使用该值进行暗色模式判断
 *      - 在 `/src/critical.js` 中有相关逻辑
 * - 否则，使用 media query 进行自动判断
 */
export const UI_THEME = 'UI_THEME';
