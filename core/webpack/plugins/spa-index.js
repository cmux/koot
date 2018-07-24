// https://github.com/jantimon/html-webpack-plugin

'use strict';

// const fs = require('fs-extra')
const path = require('path')
const ejs = require('ejs')

const writeChunkmap = require('../../../utils/write-chunkmap')
const inject = require('../../../ReactSPA/inject')

class SpaIndexPlugin {
    constructor({
        localeId,
    }) {
        this.localeId = localeId
    }

    apply(compiler) {
        const localeId = this.localeId

        // Backwards compatible version of: compiler.plugin.emit.tapAsync()
        compiler.hooks.emit.tapAsync.bind(compiler.hooks.emit, 'SpaIndexPlugin')((compilation, callback) => {
            let chunkmap

            Promise.resolve()
                .then(() => writeChunkmap(compilation.getStats()))
                .then(res => {
                    chunkmap = res
                    // console.log(chunkmap)
                    const template = ejs.render(
                        process.env.SUPER_HTML_TEMPLATE, {
                            inject: inject({ localeId, chunkmap, compilation })
                        }, {

                        }
                    )
                    const filename = `index${localeId ? `.${localeId}` : ''}.html`
                    const basename = path.basename(filename)
                    if (compilation.fileDependencies.add) {
                        compilation.fileDependencies.add(filename)
                    } else {
                        // Before Webpack 4 - fileDepenencies was an array
                        compilation.fileDependencies.push(filename)
                    }
                    compilation.assets[basename] = {
                        source: () => template,
                        size: () => template.length
                    }
                })
                // Let webpack continue with it
                .then(() => {
                    callback();
                });
        });
    }
}

module.exports = SpaIndexPlugin;
