// import axios from "axios";
import { loadConfig } from "../utils/auth";
import request from "../utils/xxlRequest";
import { xxlJobLogin, xxlJobProxy, isTauri } from "./tauri";
// import {xxlPassword, xxlUsername} from "../utils/xxlRequest";


/**
 * XXL-Job 登录接口
 * 通过 Electron IPC 在主进程中处理，避免 CORS 问题
 */
export async function xxlLogin(): Promise<any> {
    const config = await loadConfig()
    let xxlBaseUrl = config?.xxlJobUrl ?? "";
    const xxlUsername = config?.xxlUsername ?? "";
    const xxlPassword = config?.xxlPassword ?? "";
    // DEV 浏览器环境下把绝对地址转为相对路径，走 vite 代理避免 CORS
    if (import.meta.env.DEV && xxlBaseUrl) {
        try { xxlBaseUrl = new URL(xxlBaseUrl).pathname.replace(/\/+$/, ""); } catch { /* 地址非法时保持原值 */ }
    }
    console.log(`[XXL-Job] 登录: ${xxlBaseUrl}`, xxlUsername, xxlPassword);
    try {
      // 1. 优先使用 Electron IPC 方式
      if (isTauri()) {
        console.log("[XXL-Job] 使用 Tauri 主进程代理登录");
        const res = await xxlJobLogin({
          baseUrl: xxlBaseUrl,
          userName: xxlUsername,
          password: xxlPassword,
        });
        console.log(`主进程代理登录结果 ${JSON.stringify(res)}`);
        return res;
      }

    // 2. 非 Electron 环境降级：DEV 下走 vite 代理（/xxl-job-admin），生产浏览器直连
    else {
        const proxyBase = import.meta.env.DEV ? "/xxl-job-admin" : "";
        console.warn(`[XXL-Job] 非 Electron 环境，${proxyBase ? "走 vite 代理" : "直接请求"}`);
        const loginConfig: any = {
            url: `${proxyBase}/auth/doLogin`,
            method: "post",
            data: new URLSearchParams({
                userName: xxlUsername,
                password: xxlPassword,
            }),
            withCredentials: true,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "X-Requested-With": "XMLHttpRequest",
            },
        };
        return await request(loginConfig);
    }
    } catch (error) {
      console.error("XXL-Job 登录失败:", error);
      throw error;
    }
};
/**
 * XXL-Job 专用 post 请求
 * 采用主进程代理模式，彻底解决 CORS 和 Cookie 问题
 */
export const postByXXL = async <K>(url: string, data: object, retryCount = 0): Promise<K> => {
    // 1. 优先使用 Electron 代理
    if (isTauri()) {
        try {
            console.log(`[XXL-Job Proxy] 请求: ${url} `, data);
            
            // 调用主进程代理
            const result = await xxlJobProxy({
                url: url,
                method: "post",
                data: data
            });
            console.log("[XXL-Job Proxy] 响应:", result);
            // 检查业务状态码
            // 假设 XXL-Job 成功 code 为 200，失败可能为 500 或其他，未登录通常为 203 或 401
            if (result.status === 200) {
                // 检查业务内部 code
                if (
                    result.data.code === 500
                ) {
                    // 业务逻辑错误
                    throw { response: { data: result.msg }, message: result.data.msg };
                } else if  (result.data.code !== 203) {
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

            if (isAuthError && retryCount < 10) {
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
    
    // 2. 非 Electron 环境降级：DEV 下走 vite 代理（url 前缀 /xxl-job-admin），浏览器同源无 CORS
    else {
        if (!import.meta.env.DEV) {
            console.warn("[XXL-Job] 非 Electron 生产环境，代理不可用");
            throw new Error("XXL-Job proxy not available");
        }
        try {
            const proxyUrl = url.startsWith("/xxl-job-admin") ? url : `/xxl-job-admin${url.startsWith("/") ? "" : "/"}${url}`;
            // XXL-Job 后端要求表单参数，axios 默认会序列化为 JSON，这里显式转 URLSearchParams
            const formData = new URLSearchParams();
            Object.entries(data as Record<string, unknown>).forEach(([k, v]) => {
                formData.append(k, v === null || v === undefined ? "" : String(v));
            });
            return await request<K>({
                url: proxyUrl,
                method: "post",
                data: formData,
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                    "X-Requested-With": "XMLHttpRequest",
                },
                withCredentials: true,
            });
        } catch (error: any) {
            const isAuthError =
                error.response?.status === 401 ||
                (error.response?.data?.code && error.response.data.code !== 200);
            if (isAuthError && retryCount < 10) {
                console.log(`[XXL-Job] 认证失效，尝试重新登录... (重试: ${retryCount + 1})`);
                await xxlLogin();
                return postByXXL(url, data, retryCount + 1);
            }
            throw error;
        }
    }
};

