
// Parameter interface
import {get, post} from "./index.ts";

export interface LoginParams {
    /* */
    username?: string;

    /* */
    password?: string;
}

// Response interface
export interface LoginRes {
    accessToken: string;
    tokenType: string;
    expiresIn: number;
    refreshToken: string;
    scope: string[]; // 假设 scope 是字符串数组，如 ["read", "write"]
}

/**
 * 登录
 * @param {object} params LoginReq
 * @param {string} params.username
 * @param {string} params.password
 * @returns
 */
export function login(params: LoginParams): Promise<LoginRes> {
    return post(`/oauth2/login`, params);
}

// Response interface
export interface GetCurrentUserRes {}

/**
 * 获取当前用户信息接口
 * @returns
 */
export function getCurrentUser(): Promise<GetCurrentUserRes> {
    return get(`/oauth2/user`);
}