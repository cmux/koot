const fs = require('fs-extra');
const path = require('path');

const getCwd = require('koot/utils/get-cwd');
const resolveDir = require('koot/utils/resolve-dir');

// ============================================================================
// Commons
// ============================================================================

/**
 * 扩展并过滤打包结果目录下的 package.json 的依赖项
 * @async
 * @param {Object} dependencies
 * @returns {Object} 过滤后的依赖项列表对象
 */
const extendAndFilterDistPackageDependencies = async (dependencies = {}) => {
    // 如果传入的是 package.json 内容对象
    if (dependencies && dependencies.name && dependencies.dependencies) {
        dependencies.dependencies = await extendAndFilterDistPackageDependencies(
            dependencies.dependencies
        );
        return dependencies;
    }

    /** 过滤项，满足条件的依赖将被移除 */
    const ignores = [/^koot$/, /^koot-webpack$/, /^@types\//];
    if (process.env.KOOT_SERVER_MODE === 'serverless') {
        ignores.push(/^pm2$/);
    }

    /** koot module 所属目录 */
    const packageKoot = await fs.readJson(
        path.resolve(resolveDir('koot'), 'package.json')
    );

    // 将 koot 的依赖添加到 dependencies
    Object.assign(dependencies, packageKoot.dependencies);

    // 处理过滤
    Object.keys(dependencies).forEach(dep => {
        if (ignores.some(regex => regex.test(dep))) delete dependencies[dep];
    });

    return dependencies;
};

// ============================================================================
// Main Function
// ============================================================================

/**
 * 在全部打包流程后，添加文件
 * @async
 * @void
 */
module.exports = async (kootConfig = {}) => {
    if (process.env.WEBPACK_BUILD_ENV !== 'prod') return;
    if (
        process.env.WEBPACK_BUILD_TYPE === 'isomorphic' &&
        process.env.WEBPACK_BUILD_STAGE !== 'server'
    )
        return;

    const { dist } = kootConfig;

    // ========================================================================

    /**
     * 写入文件名以 `.` 开头的文件
     * @async
     * @param {string} filenameWithoutDot 不包含 `.` 的文件名
     * @void
     */
    const writeDotFile = async filenameWithoutDot => {
        const content = await fs.readFile(
            path.resolve(__dirname, 'dot-files', filenameWithoutDot),
            'utf-8'
        );
        await fs.writeFile(
            path.resolve(dist, `.${filenameWithoutDot}`),
            content,
            'utf-8'
        );
    };
    /**
     * 获取模板文件的内容
     * @async
     * @param {string} templateFilename 模板文件名
     * @returns {string}
     */
    const getTemplateContent = async templateFilename =>
        await fs.readFile(
            path.resolve(__dirname, 'templates', templateFilename),
            'utf-8'
        );

    // ========================================================================

    /** 项目目录 */
    const cwd = getCwd();
    /** 当前是否是测试模式 */
    const kootTest = JSON.parse(process.env.KOOT_TEST_MODE);
    /** 项目的 Koot.js 配置对象 */
    // const kootConfig = {
    //     ...require('koot/defaults/koot-config'),
    //     ...require(path.resolve(cwd, 'koot.config.js'))
    // };
    /** 需要写入的文件名以 `.` 开头的文件 */
    const dotfiles = ['eslintignore', 'gitignore', 'prettierignore'];
    /** 模板文件 `package.json` 的内容 */
    const packageJson = JSON.parse(await getTemplateContent('package.json'));

    if (process.env.WEBPACK_BUILD_TYPE === 'isomorphic') {
        /** 项目的 package.json 文件 */
        const packageProject = await fs.readJson(
            path.resolve(cwd, 'package.json')
        );

        /** 打包目录中的 package.json 内容对象 */
        const pkg = Object.assign({}, packageJson, {
            name: `${packageProject.name}-server`,
            dependencies: await extendAndFilterDistPackageDependencies(
                packageProject.dependencies
            )
        });

        // 复制 ./files 下的所有文件到打包结果目录
        await fs.copy(path.resolve(__dirname, 'files'), dist, {
            overwrite: true
        });

        // 写入 package.json
        await fs.writeJson(path.resolve(dist, 'package.json'), pkg, {
            spaces: 4
        });

        if (kootTest) {
            Object.assign(pkg, packageJson, {
                devDependencies: packageProject.devDependencies || {}
            });
            if (/file:/.test(pkg.dependencies.koot)) {
                pkg.dependencies.koot = pkg.dependencies.koot.replace(
                    /file:/,
                    'file:../'
                );
            }
            await fs.writeJson(path.resolve(dist, 'package.json'), pkg);
        }

        if (process.env.KOOT_SERVER_MODE !== 'serverless') {
            dotfiles.push('dockerignore');

            // 写入 Dockerfile
            await fs.writeFile(
                path.resolve(dist, `Dockerfile`),
                (await getTemplateContent('Dockerfile')).replace(
                    /\[\[PORT\]\]/g,
                    kootConfig.port
                ),
                'utf-8'
            );
        }
    }

    // 写入开头带 . 的文件
    for (const dotfile of dotfiles) {
        await writeDotFile(dotfile);
    }
};
