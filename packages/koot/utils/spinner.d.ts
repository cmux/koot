import { Ora, Options } from 'ora';

/**
 * CLI: 显示载入状态提示动画
 * - 使用 `ora` 创建
 */
function spninner(
    /**
     * `ora` 的选项
     * - 也可以仅提供提示文本 string
     * - 默认提示动画: `spinner: dots`
     * - 默认颜色: `color: cyan`
     */
    options: Options | string = {}
): Ora;

export default spninner;
