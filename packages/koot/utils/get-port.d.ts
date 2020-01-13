/**
 * 获取当前环境的服务器端口号
 */
function getPort(
    portConfig?:
        | number
        | {
              prod?: number;
              dev?: number;
          },
    currentEnv?: 'prod' | 'dev'
): number;

export default getPort;
