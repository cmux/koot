/* global
    Store:false,
    History:false,
    __KOOT_SSR_ROOT_RENDER_PROPS__:false,
    __KOOT_SSR__:false
*/

import React from 'react'
import { renderToString } from 'react-dom/server'
import RootIsomorphic from './root-isomorphic'

__KOOT_SSR__.result = renderToString(
    <RootIsomorphic
        store={Store}
        {...__KOOT_SSR_ROOT_RENDER_PROPS__}
    />
)

export default __KOOT_SSR__.result
