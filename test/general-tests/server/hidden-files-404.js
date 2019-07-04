const http = require('http');

/**
 * 通用测试：访问隐藏文件返回 404
 */
module.exports = async origin => {
    const res = await new Promise(resolve => {
        http.get(`${origin}/.hidden-picture.jpg`, res => {
            let data = '';
            // A chunk of data has been recieved.
            res.on('data', chunk => {
                data += chunk;
            });
            // The whole response has been received. Print out the result.
            res.on('end', () => {
                resolve(res);
            });
        }).on('error', err => {
            console.log('Error: ' + err.message);
        });
    });

    expect(typeof res).toBe('object');
    expect(res.statusCode).toBe(404);
};
