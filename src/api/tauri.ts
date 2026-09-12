// Tauri IPC 适配层：封装 invoke 调用，最小化业务代码改动。
// 对应 Electron 主进程中的 IPC channel，命名由 kebab-case 转为 snake_case。
import { invoke } from '@tauri-apps/api/core'

export interface ConfigData {
  serviceUrl: string
  xxlJobUrl: string
  logFilePath: string
  xxlUsername?: string
  xxlPassword?: string
}

export interface Result<T = any> {
  success: boolean
  data?: T
  message?: string
}

// 判断是否运行在 Tauri 环境（替代原 window.electronAPI 存在性判断）
export const isTauri = (): boolean =>
  typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window

// --- 配置读写 ---
export const getConfig = () => invoke<Result<ConfigData>>('get_config')

export const saveConfig = (config: ConfigData) =>
  invoke<Result>('save_config', { config })

export const resetConfig = () => invoke<Result<ConfigData>>('reset_config')

// --- XXL-Job 代理 ---
export const xxlJobLogin = (payload: {
  baseUrl: string
  userName: string
  password: string
}) => invoke<any>('xxl_job_login', { ...payload })

export const xxlJobProxy = (payload: {
  url: string
  method?: string
  data?: any
}) => invoke<any>('xxl_job_proxy', { ...payload })
