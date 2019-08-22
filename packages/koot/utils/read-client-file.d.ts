import * as webpack from 'webpack';
import { LocaleId } from '../index';

/**
 * _仅服务器端_
 *
 * 读取目标文件的内容
 *
 * 该文件必须为客户端打包结果
 */
function readClientFile(
    /** 要查找的文件的文件名。根据打包文件对应表 (chunkmap) 查询文件名和实际打包结果文件的对应关系 */
    filename: string,
    /** 对应语种。默认为当前语种 (i18n开启时) */
    localeId?: LocaleId,
    /** Webpack compilation 对象。如果提供，直接从 compilation 对象中抽取结果 */
    compilation?: webpack.compilation.Compilation,
    /** 如果标记为 true，表示提供的 filename 为确切的相对于客户端打包根目录的文件路径，无需查询对照表，直接返回结果 */
    isPathname?: boolean
): string;
function readClientFile(
    /** 表示提供的 filename 为确切的相对于客户端打包根目录的文件路径，无需查询对照表，直接返回结果 */
    isPathname?: true,
    /** 要查找的文件的文件名。根据打包文件对应表 (chunkmap) 查询文件名和实际打包结果文件的对应关系 */
    filename: string,
    /** 对应语种。默认为当前语种 (i18n开启时) */
    localeId?: LocaleId,
    /** Webpack compilation 对象。如果提供，直接从 compilation 对象中抽取结果 */
    compilation?: webpack.compilation.Compilation
): string;

export default readClientFile;
