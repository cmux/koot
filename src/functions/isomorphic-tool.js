const tool = {

    /**
     * 读取某个目录下的文件
     * 例如：读取打包目录下的所以文件列表
     * 
     * @memberof ReactIsomorphic
     */
    readFilesInPath: (dir) => {

        const fs = require('fs')
        const path = require('path')

        return fs.readdirSync(path.resolve(process.cwd(), dir))
    },

    /**
     * 筛选出指定文件
     * 每次打包后的入库文件都把文件名hash一下，避免缓存问题，支持PWA的时候也需要这样
     * 例如：找到客户端入库文件  eg：[name].[hash].js  => client.dndavxcxq323ndfs.js
     * 
     * @memberof ReactIsomorphic
     */

    filterTargetFile: (files, name, ext) => {

        let regexp = new RegExp(`^${name}\.([^.]+).${ext}$`)

        for (let i = 0; i < files.length; i++) {
            let file = files[i]
            if (regexp.test(file)) return file
        }

        return false
    }

}

export default tool