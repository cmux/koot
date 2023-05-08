import axios from 'axios';

/**
 * 检测当前是否处于 CM 内网
 * @async
 * @returns {boolean}
 */
const isCM = async () => {
    try {
        const res = await axios.get(
            'https://uxapi.cmcm.com/api/get_network_info'
        );
        const data = res.data;

        if (
            !data ||
            data.code !== 200 ||
            !data.data ||
            !data.data.is_cm_network
        )
            return false;

        return true;
    } catch (e) {
        return false;
    }
};

export default isCM;
