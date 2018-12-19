let UC_API_PREFIX_V1 = 'https://uxapi.cmcm.com/api/v1';

if( __DEV__ ){
    UC_API_PREFIX_V1 = '/uc/api/v1';
}

export default {
    // 用户信息 api 接口
    // USER: `${UC_API_PREFIX_V1}/user/:user_id`,
    /**
     * @description POST 用户登陆授权
     * @param   email
     * @param   password
     */
    SINGNIN: `${UC_API_PREFIX_V1}/auth/login`,

}
