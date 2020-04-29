import React from 'react';
import { extend } from 'koot';
import Button from 'biz-components/components/button';

if (__CLIENT__) console.log('!:!:! KOOT TEST VIEW: WELCOME PAGE !:!:!');

export default extend({
    connect: (state) => ({
        localeId: state.localeId,
    }),
    pageinfo: (/*state, renderProps*/) => ({
        title: __('title'),
        metas: [{ description: __('title') }, { 'page-name': 'home' }],
    }),
    styles: require('./styles.less'),
    name: 'PageHome',
})(({ className, localeId }) => {
    if (__DEV__) console.log(Button);
    return (
        <div className={className} id="page-home-body">
            <h2>props.localeId</h2>
            <p>{localeId}</p>
            <h2>Koot.js</h2>
            <p>
                Qui reprehenderit sunt ut nostrud mollit fugiat esse consequat
                quis id officia officia. Adipisicing officia tempor esse
                adipisicing excepteur cillum Lorem non consequat magna. Duis
                cillum reprehenderit qui minim est eu. Esse labore cillum
                voluptate labore nostrud anim occaecat enim tempor quis et ipsum
                ut. Magna pariatur do consequat proident mollit eiusmod non.
                Irure anim ex cupidatat id culpa nulla nulla. Mollit minim
                deserunt nostrud nulla ad in enim anim.
            </p>
        </div>
    );
});
