/**
 * 确保 URL 结尾的斜杠
 */
const ensureUrlTrailingSlash = url => {
    if (url.substr(url.length - 1, 1) === '/') return url;
    return url + '/';
};

module.exports = ensureUrlTrailingSlash;
