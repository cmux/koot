/* global
    Store:false,
    History:false,
    __KOOT_SSR_ROOT_RENDER_PROPS__:false,
    __KOOT_SSR__:false
*/

import React from 'react'
import { renderToString } from 'react-dom/server'
import RootIsomorphic from './root-isomorphic'

const ssr = () => {

    // console.log({
    //     Store,
    //     History,
    //     __KOOT_SSR_ROOT_RENDER_PROPS__,
    // })

    __KOOT_SSR__.result = renderToString(
        <RootIsomorphic
            store={Store}
            {...__KOOT_SSR_ROOT_RENDER_PROPS__}
        />
    )

}

ssr()

export default ssr
