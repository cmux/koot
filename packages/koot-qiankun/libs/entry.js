import { CLIENT_MOUNT, CLIENT_UNMOUNT } from 'koot/defaults/defines-window';

if (!window.__POWERED_BY_QIANKUN__) {
    window?.[CLIENT_MOUNT]?.();
}

/**
 * The bootstrap will only be called once when the child application is initialized.
 * The next time the child application re-enters, the mount hook will be called directly, and bootstrap will not be triggered repeatedly.
 * Usually we can do some initialization of global variables here,
 * such as application-level caches that will not be destroyed during the unmount phase.
 */
export async function bootstrap() {
    // eslint-disable-next-line no-console
    if (__DEV__) console.log('[koot-qiankun] App bootstraped');
}

/**
 * The mount method is called every time the application enters,
 * usually we trigger the application's rendering method here.
 */
export async function mount(props) {
    // eslint-disable-next-line no-console
    if (__DEV__) console.log('[koot-qiankun] Mounting app', props);

    window?.[CLIENT_MOUNT]?.({
        container: props.container.querySelector('#root'),
        qiankun: props,
    });
}

/**
 * Methods that are called each time the application is switched/unloaded,
 * usually in this case we uninstall the application instance of the subapplication.
 */
export async function unmount(props) {
    window?.[CLIENT_UNMOUNT]?.({
        container: props.container.querySelector('#root'),
    });
}

/**
 * Optional lifecycle，just available with loadMicroApp way
 */
export async function update(props) {
    // eslint-disable-next-line no-console
    if (__DEV__) console.log('[koot-qiankun] Update props', props);
}
