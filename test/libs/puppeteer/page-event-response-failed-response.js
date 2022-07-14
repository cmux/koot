const ignoredStatus = [302, 304];

/**
 * 为 _page_ 添加 _response_ 事件，讲所有失败的请求添加到 _arrFailedResponse_ 数组中
 * @param {Page} page
 * @param {Array} arrFailedResponse
 */
module.exports = (page, arrFailedResponse) => {
    page.on('response', (res) => {
        if (ignoredStatus.includes(res.status())) return;
        if (!res.ok()) {
            res.ref = page;
            arrFailedResponse.push(res);
        }
    });
};
