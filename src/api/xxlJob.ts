// import axios from "axios";
import { loadConfig } from "../utils/auth";
import request from "../utils/xxlRequest";
import {xxlPassword, xxlUsername} from "../utils/xxlRequest";


/**
 * XXL-Job 登录接口
 * 通过 Electron IPC 在主进程中处理，避免 CORS 问题
 */
export async function xxlLogin(): Promise<any> {
    const config = await loadConfig()
    const xxlBaseUrl = config?.xxlJobUrl ?? "";
    try {
      // 1. 优先使用 Electron IPC 方式
      if (window.electronAPI && window.electronAPI.invoke) {
        console.log("[XXL-Job] 使用 Electron 主进程代理登录");
        const res =  await window.electronAPI.invoke("xxl-job-login", {
          baseUrl: xxlBaseUrl,
          userName: xxlUsername,
          password: xxlPassword,
        });
        console.log(`主进程代理登录结果 ${JSON.stringify(res)}`);
        return res;
      }

      // 2. 非 Electron 环境或降级方案 (可能仍受浏览器策略限制)
      console.warn("[XXL-Job] 非 Electron 环境，尝试直接请求 (可能失败)");
      const loginConfig: any = {
        url: "/auth/doLogin",
        method: "post",
        data: new URLSearchParams({
          userName: xxlUsername,
          password: xxlPassword,
        }),
        baseURL: xxlBaseUrl,
        withCredentials: true,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "X-Requested-With": "XMLHttpRequest",
        },
      };
      return await request(loginConfig);
    } catch (error) {
      console.error("XXL-Job 登录失败:", error);
      throw error;
    }
}
/**
 * XXL-Job 专用 post 请求
 * 采用主进程代理模式，彻底解决 CORS 和 Cookie 问题
 */
export const postByXXL = async <K>(url: string, data: object, retryCount = 0): Promise<K> => {
    // 1. 优先使用 Electron 代理
    if (window.electronAPI && window.electronAPI.invoke) {
        try {
            console.log(`[XXL-Job Proxy] 请求: ${url}`);
            
            // 调用主进程代理
            const result = await window.electronAPI.invoke("xxl-job-proxy", {
                url: url,
                method: "post",
                data: data
            });
            console.log("[XXL-Job Proxy] 响应:", result);
            // 检查业务状态码
            // 假设 XXL-Job 成功 code 为 200，失败可能为 500 或其他，未登录通常为 203 或 401
            if (result.status === 200) {
                // 检查业务内部 code
                if (result.data.code !== 203) {
                  return result.data as K;
                } else {
                  // 业务逻辑错误
                  throw { response: { data: result.data } };
                }
            } else if (result.status === 401 || result.data?.code === 203 || result.data?.msg?.includes("not login")) {
                // 认证失败
                throw { response: { status: 401, data: result.data } };
            } else {
                // 其他 HTTP 错误
                throw { response: { status: result.status, data: result.data } };
            }

        } catch (error: any) {
            console.log('[XXL-Job Proxy] 请求错误:', error);

            // 检查是否是认证失败
            const isAuthError =
                error.response?.data?.code === 203 ||
                error.response?.status === 401 ||
                error.response?.data?.msg?.includes("not login") ||
                error.message?.includes("not login");

            if (isAuthError && retryCount < 2) {
                console.log(`[XXL-Job] 认证失效，尝试重新登录... (重试: ${retryCount + 1})`);
                try {
                    await xxlLogin();
                    // 重新登录成功后，递归重试当前请求
                    return postByXXL(url, data, retryCount + 1);
                } catch (loginErr) {
                    console.error('[XXL-Job] 重新登录失败', loginErr);
                    throw new Error('XXL-Job 登录失败');
                }
            }
            throw error;
        }
    } 
    
    // 2. 非 Electron 环境降级（如果需要支持浏览器直连，需保留原有 request 逻辑，但会有 CORS 风险）
    else {
        console.warn("[XXL-Job] 非 Electron 环境，代理不可用");
        throw new Error("XXL-Job proxy not available");
    }
};

