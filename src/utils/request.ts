import { getToken, removeLocalInfo } from "./auth";
import router from "../router/index";
import axios, {
  AxiosInstance,
  AxiosError,
  AxiosResponse,
  AxiosRequestConfig,
  InternalAxiosRequestConfig
} from "axios";
import { ElMessage } from "element-plus";
console.log(import.meta.env.MODE);
// const baseUrl = import.meta.env.VITE_BASE_URL;
const baseUrl = 'http://192.168.1.169:9980/'
console.log(baseUrl, 'baseUrl', import.meta.env.DEV);
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.DEV  ? '/api' : baseUrl,
  timeout: 60000,
});

service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token) {
      // config.headers = {
      //   ...config.headers,
      //   Authorization: `Bearer ${token}`,
      // };
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    console.log(error);
    return Promise.reject();
  }
);

service.interceptors.response.use(
  <T>(response: AxiosResponse<T>) => {
    if (response.status === 200) {
      // console.log(response, "response");
      const result: T = response.data;
      return result;
    } else {
      Promise.reject();
    }
  },
  (error: AxiosError) => {
    console.log(error);
    const response: AxiosResponse<any> | undefined = error.response;
    switch (response?.status) {
      case 400:
        error.message = "请求错误";
        break;
      case 401:
        error.message = "未授权，请登录";
        removeLocalInfo();
        router.push("/login");
        location.href = "";
        break;
      case 403:
        error.message = "拒绝访问";
        break;
      case 404:
        error.message = `请求地址出错: ${response?.config?.url}`;
        break;
      case 408:
        error.message = "请求超时";
        break;
      case 500:
        error.message = "服务器内部错误";
        break;
      case 501:
        error.message = "服务未实现";
        break;
      case 502:
        error.message = "网关错误";
        break;
      case 503:
        error.message = "服务不可用";
        break;
      case 504:
        error.message = "网关超时";
        break;
      case 505:
        error.message = "HTTP版本不受支持";
        break;
      default:
    }
    ElMessage.error(
      response?.data?.techMsg || response?.data?.errorMsg || error.message
    );
    return Promise.reject(error);
  }
);

const request = async <T = any>(
  config: AxiosRequestConfig
): Promise<T | any> => {
  const data = await service.request<T>(config);
  return data;
};

export default request;
