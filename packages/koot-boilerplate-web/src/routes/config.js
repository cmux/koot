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
        {
            path: '',
            component: Home,
        },
        {
            // 404页面
            path: '*',
            component: NotFound,
        },
    ],
};
