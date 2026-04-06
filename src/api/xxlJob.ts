// import axios from "axios";
import request from "../utils/xxlRequest";
import {xxlBaseUrl, xxlPassword, xxlUsername} from "../utils/xxlRequest";



/**
 * XXL-Job 登录接口
 * 通过 Electron IPC 在主进程中处理，避免 CORS 问题
 */
export async function xxlLogin(): Promise<any> {
    try {
        // 检查是否在 Electron 环境中
        if (window.electronAPI) {
            const response = await fetch(`${xxlBaseUrl}/auth/doLogin`, {
                method: 'POST',
                body: new URLSearchParams({
                    userName: xxlUsername,
                    password: xxlPassword,
                }),
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Referer': `${xxlBaseUrl}/auth/login`,
                }
            });
            return response
        } else {
            // 降级方案：使用 fetch（可能会有 CORS 限制）
            console.warn('不在 Electron 环境中，使用 fetch 降级方案');
        }
    } catch (error) {
        console.error('XXL-Job 登录失败:', error);
        throw error;
    }
}
/**
 * XXL-Job 专用 post 请求
 * 自动检测 cookie，如果失效则自动登录
 * 注意：在浏览器环境中，cookie 由浏览器自动管理，同时我们手动维护 utoken
 */
export const postByXXL = async <K>(url: string, data: object, retryCount = 0): Promise<K> => {
    try {
        const config: any = {
            url: url,
            method: "post",
            data: data,
            baseURL: xxlBaseUrl,
            withCredentials: true, // 浏览器会自动携带 cookie
            headers: {
                'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With': 'XMLHttpRequest',
            } as Record<string, string>,
        };
        // 注意：不需要手动设置 Cookie header
        // xxlRequest 的拦截器会自动添加 utoken（如果有）

        return await request(config);
    } catch (error: any) {
        console.log('XXL-Job 请求错误:', error.message || error);

        // 检查是否是认证失败（包括 XXL-Job 的自定义异常）
        const isAuthError =
            error.response?.status === 401 ||
            error.message?.includes('not login') ||
            error.message?.includes('XxlSsoException');

        // 如果是认证失败且重试次数小于 2，尝试重新登录
        if (isAuthError && retryCount < 2) {
            console.log(`XXL-Job 认证失败，尝试重新登录... (重试次数：${retryCount + 1})`);

            try {
                // 执行登录
                await xxlLogin();
            } catch (loginError: any) {
                console.error('XXL-Job 重新登录失败:', loginError);
                throw new Error('XXL-Job 登录失败，请检查用户名和密码是否正确');
            }
        }

        throw error;
    }
};

