/**
 * 根据内部的请求地址 `pathname` 返回真正的页面内的请求 URI
 * - 如果传入 Array，结果返回也是 Array
 */
function getURI(
    /** 原始请求地址，通常为 Webpack 输出结果 */
    pathname: string | string[]
): string | string[] | undefined;

export default getURI;
