/* eslint-disable @typescript-eslint/no-explicit-any */

import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { DefaultRootState } from 'react-redux';
import * as actionTypes from '@constants/action-types';

// 综合 ========================================================================

// `redux-thunk` Action =======================================================
export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    DefaultRootState,
    unknown,
    Action<string>
>;

// Redux State ================================================================
export interface UIState {
    [metaKey: string]: any;
}
export interface AppState {
    type?: string;
    session?: string;
}
declare module 'react-redux' {
    interface DefaultRootState {
        app: AppState;
    }
}

// Redux Action ===============================================================
interface UpdateAppTypeAction
    extends Action<typeof actionTypes.UPDATE_APP_TYPE> {
    payload: string;
}
export type ActionTypes = UpdateAppTypeAction;
