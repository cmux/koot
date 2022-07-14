// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="global.d.ts" />

import { Store } from 'redux';
import { DefaultRootState } from 'react-redux';
import { ThunkAction } from 'redux-thunk';
import { History } from 'history';
import Koa from 'koa';

// ============================================================================

interface Cache {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

declare namespace Koot {
    // general informations =======================================================

    /**
     * 获取当前请求对应到项目的语种ID
     *
     * > **⚠️** 仅在 `SSRMode === 'vm'` 时有效，其他 SSR 模式下该函数禁用
     *
     * > **⚠️** 当前仅有 `vm` 模式，在未来会加入其他模式
     */
    const getLocaleId: () => LocaleId;
    /** 当前请求对应到项目的语种ID */
    type LocaleId = string;

    /**
     * 获取 _Redux store_ 对象
     *
     * > **⚠️** 仅在 `SSRMode === 'vm'` 时有效，其他 SSR 模式下该函数禁用
     *
     * > **⚠️** 当前仅有 `vm` 模式，在未来会加入其他模式
     */
    const getStore: () => Store<DefaultRootState, ThunkAction | A>;

    /**
     * 获取封装后的 History 对象
     *
     * > **⚠️** 仅在 `SSRMode === 'vm'` 时有效，其他 SSR 模式下该函数禁用
     *
     * > **⚠️** 当前仅有 `vm` 模式，在未来会加入其他模式
     */
    const getHistory: () => History;

    /**
     * 获取公用缓存空间
     * - 如果 `localeId` 为 `true`，返回对应当前语种的独立对象
     * - 如果 `localeId` 为 string，返回对应语种的独立对象
     * - 默认返回公用对象
     *
     * ---
     *
     * - _客户端_: 返回 `window` 上的一个对象
     * - _服务器端_: 在 session 间共享的对象，服务器启动时创建
     *
     * ---
     *
     * > **⚠️** 客户端与服务器端的结果不同，在编写同构逻辑时请注意
     *
     * > **⚠️** 公用对象空间内不包含对应语种的对象，需要对应语种的结果时需要提供 `localeId`
     */
    export function getCache(localeId?: LocaleId | boolean): Cache;

    /**
     * **SERVER ONLY** 获取 Koa ctx 对象
     *
     * > **⚠️** 仅在 `SSRMode === 'vm'` 时有效，其他 SSR 模式下该函数禁用
     *
     * > **⚠️** 当前仅有 `vm` 模式，在未来会加入其他模式
     *
     * ---
     *
     * > **⚠️** _仅针对_ 服务器端
     *
     * > **⚠️** 客户端返回 undefined
     */
    export function getCtx():
        | Koa<Koa.DefaultState, Koa.DefaultContext>
        | undefined;
}
export = Koot;
export as namespace Koot;

//

export * from './React/component-extender';
export * from './React/redux';
