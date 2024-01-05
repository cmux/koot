import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron';

// ============================================================================

export function createWindow(
    options?: BrowserWindowConstructorOptions
): BrowserWindow;

export function initApp(
    createWindowOptions?: BrowserWindowConstructorOptions
): void;

/**
 * 获取打包后的 _Electron_ 主文件所在目录的绝对路径
 */
export function getElectronFilesFolder(): string;
