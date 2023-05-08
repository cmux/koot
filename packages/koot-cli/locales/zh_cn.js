const locales_zh_cn = {
    welcomeCM: '小豹你好~',
    welcome: '欢迎使用 Koot.js :)',

    please_wait: '请稍候……',
    aborted: '已终止。',
    required_info: '(*) 必填项',
    yes: '是',
    no: '否',
    ok: '确认',
    cancel: '取消',
    invalid_input: '格式错误',
    dir_exist: '目录已存在',

    about_to_create_new_project: '准备创建全新的 Koot.js 项目',
    create_new_project_using_next_boilerplate: '使用模板: NEXT',
    welcome_exist_select: '请选择命令:',
    welcome_exist_select_dev: '进入开发环境',
    welcome_exist_select_analyze: '分析打包结果',
    welcome_exist_select_build: '打包正式版本',
    welcome_exist_select_start: '打包正式版本并开启服务器',
    welcome_exist_select_upgrade: '升级 Koot.js',
    welcome_exist_current_super_project:
        'Koot CLI 工具需要 [koot] 才能运行，但当前项目目前使用 [super-project]。是否升级到 [koot]？',

    current_version: 'CLI 当前版本: ',

    'koot-cli_updated': 'koot-cli 已更新',
    'koot-cli_updated_description':
        '请升级 koot-cli 到最新版本后再执行相关命令。可使用以下命令进行更新:',
    'koot-cli_updated_suggestion':
        '另外，我们强烈推荐通过以下命令使用 koot-cli，以确保每次使用均为最新版本:',

    project_name_required: '项目名称 (*)',
    project_name_needed: '请输入项目名称',
    project_description: '项目描述',
    project_author: '开发者 (推荐填写 NPM 用户名)',
    project_type: '项目类型',
    project_types: {
        react: '同构 / SSR (Server-Side Rendering)',
        react_short: '同构 / SSR',
        'react-spa': '单页 / SPA (Single-Page App)',
        'react-spa_short': '单页 / SPA',
    },
    project_boilerplate: '模板',
    project_boilerplates: {
        base: '基础模板 (推荐 Web 项目使用)',
        base_short: '基础',
        serverless: 'Serverless 模式的基础模板',
        serverless_short: 'Serverless',
        'cm-system': '系统模板 (推荐管理/后台系统项目使用)',
        'cm-system_short': '系统',
    },
    project_server_mode: '服务器模式',
    project_server_modes: {
        normal: '标准 KOA 服务器',
        normal_short: '标准',
        serverless: 'Serverless',
        serverless_short: 'Serverless',
    },
    project_spa_mode: 'SPA 类型',
    project_spa_modes: {
        web: 'Web App',
        web_short: 'Web',
        electron: 'Electron App',
        electron_short: 'Electron',
    },
    project_project_dir: '项目代码目录 (*)',
    project_project_dir_types: {
        sub: '以项目名命名的子目录',
        curr: '当前目录',
        input: '选择...',
    },
    project_project_dir_select: '选择代码目录',
    project_package_manager: '包管理器',
    project_package_managers: {
        yarn: 'Yarn (v1)',
        npm: 'NPM',
    },
    project_dist_dir: '打包结果目录 (*)',
    project_dist_dir_needed: '请输入项目打包结果目录',
    project_i18n_enabled: '多语言支持 (i18n)',
    project_i18n_type: '多语言 (i18n) 模式',
    project_mode: '项目模式',

    project_mode_isomorphic: '同构 (Isomorphic)',
    project_mode_spa: '单页面应用 (SPA)',

    confirm_remove_exist_dir: '目标目录已存在',
    confirm_remove_exist_dir_remove: '删除并替换目标目录',
    confirm_remove_exist_dir_overwrite: '在目标目录中覆盖、追加文件',
    confirm_remove_exist_dir_input: '选择其他目录',
    removing_exist_dir: '删除目标目录',
    input_dir: '请输入路径名 (*)',

    downloading_boilerplate: '下载模板',
    copying_boilerplate: '复制模板',
    installing_dependencies: '安装依赖 (可能会运行一段时间)',
    modifying_boilerplate: '更新文件',

    whats_next: '接下来……',
    step_goto_dir: '进入项目目录',
    step_install_dependencies: '安装依赖',
    step_run_dev: '运行开发环境',
    step_visit: '等待浏览器自动打开页面',
    step_visit_for_steps: '访问以下网址以获得后续操作指南',

    welcome_upgrade: 'Koot.js 项目升级',
    upgrade_confirmation: '是否升级？',
    no_need_to_upgrade: '无需升级',
    upgrade_determining: '正在分析 package.json',
    'upgrade_error:package.json not exist': '文件未找到：package.json',
    'upgrade_error:not koot.js project': '项目并非基于 Koot.js',
    'upgrade_error:super-project version invalid':
        '[super-project] 版本号不合法',
    'upgrade_error:super-project version too low':
        '[super-project] 版本过旧。请手动更新到 [koot]',
    upgrading: '正在升级',
    upgrade_files_changed: '修改的文件：',
    upgrade_files_removed: '删除的文件：',
    'upgrade_0.2.0_warning':
        '已将 Babel 更新至 7.0，此次更新需要重写 Babel 配置。本更新程序已将现有的配置文件（.babelrc）删除，并生成了新的配置文件（babel.config.js）。如果打包失败，请参照 Babel 7.0 的全新文档自行修改 babel.config.js。',
    'upgrade_0.7.0_warning':
        '新配置项: css。详情请参见文档 -> [https://koot.js.org/#/config]',
    'upgrade_0.8.0_warning_1':
        '重新整理了配置文件规则，详情青参见文档 -> [https://koot.js.org/#/config]',
    'upgrade_0.8.0_warning_2':
        '另外，此次更新也完全重写了 React 同构服务器逻辑，原则上对已有项目不会造成影响。（若发现从 `koot` 中引用的 `store` `history` 或 `localeId` 值为 `undefined`，请尝试改为使用 `getStore()` `getHistory()` 或 `getLocaleId()` 方法）',
    'upgrade_0.9.0_warning_1':
        'Koot 0.9 中针对 SSR 项目引入了全新的客户端打包结果文件结构。',
    'upgrade_0.9.0_warning_2':
        '为了兼容性起见，使用 cli 工具升级的项目，客户端打包结果文件结构不会变化。如果你对该新功能有兴趣，可手动开启，详情青参见文档 -> [https://koot.js.org/#/config?id=bundleversionskeep]',

    'upgrade_0.15.0_warning_1':
        '此次更新包含诸多重大改动，本 CLI 工具无法进行完备的自动升级。',
    'upgrade_0.15.0_warning_2':
        '请参阅 [升级指南] 进行手动升级 -> [https://koot.js.org/#/migration/0.14-to-0.15]',
};

export default locales_zh_cn;
