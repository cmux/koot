module.exports = {
    welcomeCM: 'Hello, fellow cheetah~',
    welcome: 'Thanks for using Koot.js :)',

    please_wait: 'Please wait...',
    aborted: 'Aborted.',
    required_info: '(*) Required',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
    cancel: 'Cancel',
    invalid_input: 'Invalid input',
    dir_exist: 'Directory existed',

    about_to_create_new_project: 'About to create a new Koot.js app',
    create_new_project_using_next_boilerplate: 'Using NEXT boilerplate',
    welcome_exist_select: 'Please select command:',
    welcome_exist_select_dev: 'Enter dev mode',
    welcome_exist_select_analyze: 'Analyze bundles',
    welcome_exist_select_build: 'Build stable bundles',
    welcome_exist_select_start: 'Build and start server',
    welcome_exist_select_upgrade: 'Upgrade Koot.js',
    welcome_exist_current_super_project:
        'Koot CLI tool need [koot] to run while this project is using [super-project]. Do you want to upgrade to [koot]?',

    current_version: 'CLI current version: ',

    'koot-cli_updated': 'koot-cli has updated',
    'koot-cli_updated_description':
        'Please upgrade koot-cli to latest version. Use following command to upgrade:',
    'koot-cli_updated_suggestion':
        'Besides, we strongly suggest that use the following command to use koot-cli, so that it will be the latest version everytime:',

    project_name_required: 'App name (*)',
    project_name_needed: "Please input project's name",
    project_description: 'App description',
    project_author: 'Developer (recommended to be NPM user name)',
    project_type: 'App type',
    project_types: {
        react: 'SSR (Server-Side Rendering)',
        react_short: 'SSR',
        'react-spa': 'SPA (Single-Page App)',
        'react-spa_short': 'SPA',
    },
    project_boilerplate: 'Boilerplate',
    project_boilerplates: {
        base: 'Base (Recommended for Web App)',
        base_short: 'Base',
        serverless: 'Serverless mode for Base boilerplate',
        serverless_short: 'Serverless',
        'cm-system': 'System (Recommended for Admin/System App)',
        'cm-system_short': 'System',
    },
    project_server_mode: 'Server mode',
    project_server_modes: {
        normal: 'Normal KOA Server',
        normal_short: 'Normal',
        serverless: 'Serverless',
        serverless_short: 'Serverless',
    },
    project_spa_mode: 'SPA Type',
    project_spa_modes: {
        web: 'Web App',
        web_short: 'Web',
        electron: 'Electron App',
        electron_short: 'Electron',
    },
    project_project_dir: 'Source directory (*)',
    project_project_dir_types: {
        sub: 'Sub folder with app name',
        curr: 'Current folder',
        input: 'Select...',
    },
    project_project_dir_select: 'Select source directory',
    project_package_manager: 'Package manager',
    project_package_managers: {
        yarn: 'Yarn (v1)',
        npm: 'NPM',
    },
    project_dist_dir: 'Dist-directory (*)',
    project_dist_dir_needed: "Please input project's dist-directory",
    project_mode: 'Project mode',
    project_i18n_enabled: 'Multi-language (i18n) support',
    project_i18n_type: 'Multi-language (i18n) type',

    project_mode_isomorphic: 'Isomorphic',
    project_mode_spa: 'Single Page App (SPA)',

    confirm_remove_exist_dir: 'Target directory exists.',
    confirm_remove_exist_dir_remove: 'Remove and replace existing directory',
    confirm_remove_exist_dir_overwrite:
        'Use existing directory. Overwrite existing files',
    confirm_remove_exist_dir_input: 'Select another directory',
    removing_exist_dir: 'Removing target directory',
    input_dir: 'Input a directory (*)',

    downloading_boilerplate: 'Downloading boilerplate',
    copying_boilerplate: 'Copying boilerplate',
    installing_dependencies: 'Installing dependencies (May take a while)',
    modifying_boilerplate: 'Modifying files',

    whats_next: "What's next?",
    step_goto_dir: 'Go to target directory',
    step_install_dependencies: 'Install dependencies',
    step_run_dev: 'Run dev mode',
    step_visit: 'Wait for browser opened automatically',
    step_visit_for_steps: 'Visit the page following for further steps',

    welcome_upgrade: 'Upgrading Koot.js project',
    upgrade_confirmation: 'About to upgrade. Confirm?',
    no_need_to_upgrade: 'No need to upgrade',
    upgrade_determining: 'Analyzing package.json',
    'upgrade_error:package.json not exist': 'File not found: package.json',
    'upgrade_error:not koot.js project': 'Project is not based on Koot.js',
    'upgrade_error:super-project version invalid':
        '[super-project] version number invalid',
    'upgrade_error:super-project version too low':
        '[super-project] is too out-dated. Please update to [koot] manually',
    upgrading: 'Upgrading',
    upgrade_files_changed: 'Files changed:',
    upgrade_files_removed: 'Files removed:',
    'upgrade_0.2.0_warning':
        'Updated Babel to 7.0 that requires re-writing Babel configuration. The upgrading process has removed existing config file (.babelrc) and created a new one (babel.config.js). If encountered error when building, please edit babel.config.js refering new official Babel doc.',
    'upgrade_0.7.0_warning':
        'New configuration option: css. Check doc for more information -> [https://koot.js.org/#/config]',
    'upgrade_0.8.0_warning_1':
        'Revamp configuration options. Please make sure to check doc for more information -> [https://koot.js.org/#/config]',
    'upgrade_0.8.0_warning_2':
        'We also made a complete overhaul to React isomorphic (SSR). There will be no effect to your existing project in theory. (If you do find that the value of `store` `history` or `localeId` imported from `koot` to be `undefined`, please try using `getStore()` `getHistory()` or `getLocaleId()` funtion imported from `koot`)',
    'upgrade_0.9.0_warning_1':
        'Koot 0.9 introduces brand new file structure for client bundles of SSR project.',
    'upgrade_0.9.0_warning_2':
        'But for compatibility reason, when upgrading by using CLI tool, this new feature is disabled. If you are interested in this new feature, you can enable it manually. See doc for details -> [https://koot.js.org/#/config?id=bundleversionskeep]',

    'upgrade_0.15.0_warning_1':
        'This major update includes several BREAKING CHANGES. The CLI tool cannot upgrade local app/project automatically.',
    'upgrade_0.15.0_warning_2':
        'Please read [Migration Guide] for manual upgrading -> [https://koot.js.org/#/migration/0.14-to-0.15]',
};
