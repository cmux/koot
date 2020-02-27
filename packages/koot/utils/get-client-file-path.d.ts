import { LocaleId } from '../index';

/**
 * _仅服务器端_
 *
 * 获指定文件在客户端中的可访问路径，其结果可直接用于浏览器中的资源请求
 *
 * 返回的结果可能是数组
 */
function getFilePathnameForClient(
    /** 要查找的文件的文件名。根据打包文件对应表 (chunkmap) 查询文件名和实际打包结果文件的对应关系 */
    filename: string,
    /** 对应语种。默认为当前语种 (i18n开启时) */
    localeId?: LocaleId,
    /** 如果标记为 true，表示提供的 filename 为确切的相对于客户端打包根目录的文件路径，无需查询对照表，直接返回结果 */
    isPathname?: boolean,
    /** 如果标记为 true，表示用于 SSR 时读取文件，会对 publicPath 进行特殊处理 */
    isSSRReading?: boolean
): string | string[];
function getFilePathnameForClient(
    /** 提供的 filename 为确切的相对于客户端打包根目录的文件路径，无需查询对照表，直接返回结果 */
    isPathname: true,
    /** 要查找的文件的文件名。根据打包文件对应表 (chunkmap) 查询文件名和实际打包结果文件的对应关系 */
    filename: LocaleId,
    /** 对应语种。默认为当前语种 (i18n开启时) */
    localeId?: string,
    /** 如果标记为 true，表示用于 SSR 时读取文件，会对 publicPath 进行特殊处理 */
    isSSRReading?: boolean
): string | string[];

export default getFilePathnameForClient;
