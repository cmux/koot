import React from 'react';
import { getCtx } from 'koot';

const View: React.FC = () => {
    if (__CLIENT__) return null;

    if (__SERVER__) {
        const ctx = getCtx();
        // console.log({
        //     redirect: ctx.redirect,
        //     origin: ctx.origin
        // });
        ctx.redirect(ctx.origin);
    }

    return <span id="__test-server-cache">REDIRECTING...</span>;
};

export default View;
