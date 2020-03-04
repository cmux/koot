const fs = require('fs-extra');
const path = require('path');
const getCwd = require('koot/utils/get-cwd');
const resolveDir = require('koot/utils/resolve-dir');

// ============================================================================
// Templates
// ============================================================================

const packageJson = {
    name: '',
    main: 'index.js',
    scripts: {
        start: 'node index.js'
    },
    license: 'UNLICENSED',
    private: true,
    dependencies: {}
};
const dockerfile = `FROM node:lts
WORKDIR .
COPY package*.json .
RUN npm install --no-save
RUN npm install -g pm2
COPY . .
EXPOSE [[PORT]]
CMD ["pm2-runtime", "pm2.json"]`;

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

module.exports = async (o = {}) => {
    const { dist } = o;

    /** 项目目录 */
    const cwd = getCwd();
    /** 项目的 package.json 文件 */
    const packageProject = await fs.readJson(path.resolve(cwd, 'package.json'));
    /** 当前是否是测试模式 */
    const kootTest = JSON.parse(process.env.KOOT_TEST_MODE);
    const kootConfig = {
        ...require('koot/defaults/koot-config'),
        ...require(path.resolve(cwd, 'koot.config.js'))
    };

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

    // 写入开头带 . 的文件
    const dotfiles = [
        'dockerignore',
        'eslintignore',
        'gitignore',
        'prettierignore'
    ];
    for (const dotfile of dotfiles) {
        const content = await fs.readFile(
            path.resolve(__dirname, dotfile),
            'utf-8'
        );
        await fs.writeFile(path.resolve(dist, `.${dotfile}`), content, 'utf-8');
    }

    // 写入 Dockerfile
    await fs.writeFile(
        path.resolve(dist, `Dockerfile`),
        dockerfile.replace(/\[\[PORT\]\]/g, kootConfig.port),
        'utf-8'
    );

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
};
