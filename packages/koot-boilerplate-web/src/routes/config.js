import App from '@views/app/index.jsx';
import NotFound from '@views/404/index.jsx';
import Home from '@views/home/index.jsx';

export default {
    path: '/',
    component: App,
    // meta: {
    //     name: '根目录',
    //     icon: // 支持 () => return JSX,
    //     title: '首页',
    // },
    children: [
        // {
        //     path: '',
        //     component: Home,
        // },
        {
            path: 'home',
            component: Home,
            children: [
                {
                    path: ':id',
                    component: NotFound,
                },
            ],
        },
        // {
        //     // 404页面
        //     path: '*',
        //     component: NotFound,
        // },
        // {
        //     path: 'pathname',
        //     meta: {
        //         name: '',
        //     },
        //     component: PathComponent,
        //     children: [
        //         {
        //             path: 'pathchildname',
        //             meta: {
        //                 name: '',
        //                 showMenu: true, // 控制三级菜单的显示隐藏
        //             },
        //             component: PathchildnameComponent,
        //         },
        //     ],
        // },
    ],
};
