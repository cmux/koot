/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 生成 Webpack `optimization` 配置，用于拆分代码
 * - 仅针对: Webpack 配置生成
 */
function webpackOptimizationProd(o: {
    /** 追加库名到 libs 包中 */
    extraLibs?: string[];
}): any;

export default webpackOptimizationProd;
