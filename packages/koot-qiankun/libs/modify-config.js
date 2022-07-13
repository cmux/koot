/* eslint-disable no-console */

const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const webpack = require('webpack');
const sanitize = require('sanitize-filename');
const resolve = require('resolve');
const inquirer = require('inquirer');
const merge = require('lodash/merge');
const sharp = require('sharp');
const spinner = require('koot-cli-kit/spinner');
const spawn = require('koot-cli-kit/spawn');

const {
    keyConfigWebpackSPATemplateInject,
    keyConfigBuildDll,
    keyConfigIcons,
    CLIENT_ROOT_PATH,
} = require('koot/defaults/before-build');
const getDirDevTmp = require('koot/libs/get-dir-dev-tmp');
const getLogMsg = require('koot/libs/get-log-msg');
const isFromStartCommand = require('koot/libs/is-from-start-command');
const getCwd = require('koot/utils/get-cwd');
const newWebpackConfig = require('koot-webpack/libs/new-client-webpack-config');

const __ = require('./translate');

const defaultQiankunConfig = require('./defaults/qiankun-config');

// ============================================================================

const modifyConfig = async (appConfig) => {
    // if (appConfig[keyConfigBuildDll]) return;

    if (typeof appConfig !== 'object')
        throw new Error('MISSING_PARAMETER: appConfig');

    const { webpackConfig } = appConfig;

    // 修改 dist
    // appConfig.dist = path.resolve(appConfig.dist, 'build');

    // 修改 Webpack 配置
    appConfig.webpackConfig = await modifyWebpackConfig(
        webpackConfig,
        appConfig
    );

    return appConfig;
};

module.exports = modifyConfig;

// ============================================================================

const modifyWebpackConfig = async (webpackConfig, appConfig) => {
    if (typeof webpackConfig === 'object' && !Array.isArray(webpackConfig))
        return await modifyWebpackConfig([webpackConfig], appConfig);

    // ========================================================================
    //
    // 生成 Qiankun 配置对象
    //
    // ========================================================================
    webpackConfig
        .filter((config) => !config[keyConfigWebpackSPATemplateInject])
        .forEach((config) => {
            config.target = 'electron-renderer';
        });

    // ========================================================================
    //
    // 修改 output 类型
    //
    // ========================================================================

    // ========================================================================
    //
    // 添加新入口: qiankun-entry
    //
    // ========================================================================

    // ========================================================================
    //
    // 向所有入口注入 public-path.js
    //
    // ========================================================================

    // const lastConfig = webpackConfig
    //     .filter((config) => !config[keyConfigWebpackSPATemplateInject])
    //     .slice(-1)[0];

    // console.log('after modify', { webpackConfig, appConfig });

    return webpackConfig;
};
