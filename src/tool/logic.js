import { server } from '../test'
import fs from 'fs'

let apps = []
server.opts.forEach((opt) => {
    apps.push(`server.addSubApp('${opt.domain}', require('${opt.path}'))`)
})


const tpl = `
    module.exports = function(server) {
        ${apps.join(';')}
    }
`


// 写入文件内容（如果文件不存在会创建一个文件）  
// 写入时会先清空文件  
fs.writeFile('./src/__bridge.js', tpl, function(err) {
    if (err) {
        throw err
    }

    console.log('Saved.');

    // // 写入成功后读取测试  
    // fs.readFile('./test2.txt', 'utf-8', function(err, data) {
    //     if (err) {
    //         throw err;
    //     }
    //     console.log(data);
    // });
})