import axios, {
    AxiosInstance,
    AxiosError,
    AxiosResponse,
    AxiosRequestConfig,
} from "axios";
import { ElMessage } from "element-plus";

// XXL-Job 配置
// export const xxlBaseUrl = !import.meta.env.DEV
//     ? 'http://192.168.1.18:38080/xxl-job-admin'
//     : '/xxl-job-admin';

export const xxlUsername = 'admin'; // XXL-Job 默认用户名
export const xxlPassword = 'guorui@2026'; // XXL-Job 默认密码

// 存储 utoken（从响应中获取）
let xxlToken: string | null = null;

export function setXxlToken(token: string) {
    xxlToken = token;
}
export function getXxlToken(): string | null {
    return xxlToken;
}

// 创建 XXL-Job 专用的 axios 实例（不添加主系统的 token）
const xxlService: AxiosInstance = axios.create({
    // baseURL: xxlBaseUrl,
    timeout: 60000,
    withCredentials: true, // 允许携带 cookie
});

// XXL-Job 请求拦截器
xxlService.interceptors.request.use(
    (config) => {
        // XXL-Job 使用 cookie 认证，不需要手动添加 Authorization header
        console.log(xxlToken)
        if (xxlToken) {
            const existingCookie = config.headers['Cookie'] || '';
            config.headers['Cookie'] = existingCookie 
                ? `${existingCookie}; ${xxlToken}`
                : `${xxlToken}`;
        }
        return config;
    },
    (error: AxiosError) => {
        console.error('XXL-Job 请求拦截器错误:', error);
        return Promise.reject(error);
    }
);

// XXL-Job 响应拦截器
xxlService.interceptors.response.use(
    <T>(response: AxiosResponse<T>) => {
        if (response.status === 200) {
            return response.data;
        } else {
            ElMessage.error(`请求失败：${response.status}`);
            return Promise.reject(new Error(`请求失败：${response.status}`));
        }
    },
    (error: AxiosError) => {
        console.error('XXL-Job 响应错误:', error);

        const response = error.response;
        let errorMsg = '网络错误，请稍后重试';

        switch (response?.status) {
            case 400:
                errorMsg = '请求参数错误';
                break;
            case 401:
                errorMsg = '未授权，请登录';
                break;
            case 403:
                errorMsg = '拒绝访问';
                break;
            case 404:
                errorMsg = '请求地址不存在';
                break;
            case 500:
                errorMsg = '服务器内部错误';
                break;
            default:
                if (response?.data) {
                    try {
                        const data = response.data as any;
                        errorMsg = data.errorMsg || data.message || errorMsg;
                    } catch {
                        errorMsg = '请求失败，请稍后重试';
                    }
                }
        }

        ElMessage.error(errorMsg);
        return Promise.reject(error);
    }
);

// 导出请求方法
export const xxlRequest = async <T = any>(
    config: AxiosRequestConfig
): Promise<T | any> => {
    const data = await xxlService.request<T>(config);
    return data;
};

export default xxlRequest;

