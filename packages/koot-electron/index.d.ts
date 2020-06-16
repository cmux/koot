import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron';

// ============================================================================

export function createWindow(
    options?: BrowserWindowConstructorOptions
): BrowserWindow;

export function initApp(
    createWindowOptions?: BrowserWindowConstructorOptions
): void;
