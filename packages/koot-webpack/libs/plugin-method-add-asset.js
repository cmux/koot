const { Compilation } = require('webpack');

const newCompilationFileDependency = require('./new-compilation-file-dependency');

function addAssets(compilation, pluginName, filename, content = '') {
    compilation.hooks.processAssets.tapPromise(
        {
            name: pluginName,
            stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
        },
        async () => {
            newCompilationFileDependency(compilation, filename, content);
        }
    );
}

module.exports = addAssets;
