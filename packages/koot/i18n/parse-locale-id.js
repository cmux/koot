const parseLanguageList = require('./parse-language-list');
const availableLocaleIds = require('./locale-ids');

/**
 * 根据输入返回项目匹配的语言包ID (localeId)
 * 如果没有匹配，返回项目语言包ID的第一项
 * 注：仅为返回，没有赋值操作
 *
 * @param {string|string[]} input
 * @param {string[]} [localeIds] 可选语言ID列表
 * @returns 匹配的语言包ID localeId 或 availableLocaleIds[0]
 */
const parseLocaleId = (input, localeIds = availableLocaleIds) => {
    // 检查是否包含分号，如果是，按语言列表处理为array
    // eg: zh-CN,zh;q=0.8,en;q=0.6
    if (typeof input === 'string' && input.indexOf(';') > -1)
        input = parseLanguageList(input);

    // 检查是否为array
    if (Array.isArray(input)) {
        let id;

        input.some(thisId => {
            id = checkItem(thisId, localeIds);
            return id;
        });

        return id || localeIds[0];
    } else if (!input && typeof navigator !== 'undefined')
        return parseLocaleId(
            navigator.languages ||
                navigator.language ||
                navigator.browserLanguage ||
                navigator.systemLanguage ||
                navigator.userLanguage ||
                localeIds[0],
            localeIds
        );
    else if (input) return checkItem(input, localeIds) || localeIds[0];

    return localeIds[0];
};

module.exports = parseLocaleId;

// ============================================================================

/**
 * 标准化语言包ID，方便匹配
 * - 全部小写
 * - `_` 变为 `-`
 * @param {string} input
 * @returns {string}
 */
const normalize = localeId => localeId.toLowerCase().replace(/_/g, '-');

/**
 * 获取基础语种
 * @param {string} localeId
 * @param {string} [seperator='-'] 连接线，默认为 `-`
 * @returns {string}
 */
const getLocaleBase = (localeId, seperator = '-') =>
    localeId.split(seperator)[0];

/**
 * 检查单项，如果和availableLocales内的项目有匹配，返回匹配，否则返回null
 * @param {string} input 检查项
 * @param {string[]} [localeIds] 可选语言ID列表
 * @returns 匹配的 localeId 或 null
 */
const checkItem = (input, localeIds = availableLocaleIds) => {
    const inputNormalized = normalize(input);
    const localeIdsNormalized = localeIds.map(normalize);

    let result;

    // 如果有完整匹配的项，直接返回结果
    localeIdsNormalized.some((thisLocaleId, index) => {
        if (thisLocaleId === inputNormalized) {
            result = localeIds[index];
            return true;
        }
        return false;
    });
    if (result) return result;

    // 之后根据基础语种进行检查

    /** 基础语种 (eg: `zh-CN` 基础语种为 `zh`) */
    const baseLocale = getLocaleBase(inputNormalized, '-');

    // 如果可选列表中有对应的基础语种，返回该结果
    localeIdsNormalized.some((thisLocaleId, index) => {
        if (thisLocaleId === baseLocale) {
            result = localeIds[index];
            return true;
        }
        return false;
    });
    if (result) return result;

    // 检查可选列表中每一项的基础语种，返回第一个匹配
    localeIdsNormalized.some((thisLocaleId, index) => {
        const thisBaseLocale = getLocaleBase(thisLocaleId, '-');
        if (thisBaseLocale === baseLocale) {
            result = localeIds[index];
            return true;
        }
        return false;
    });
    if (result) return result;

    return null;
};
