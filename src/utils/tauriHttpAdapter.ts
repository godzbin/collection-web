// axios 自定义 adapter：将底层传输切换到 @tauri-apps/plugin-http 的 fetch。
// 该 fetch 由 Rust 侧 reqwest 发起，天然无浏览器 CORS 限制，
// 从而让生产态下 axios 直连后端 serviceUrl 的请求也能正常工作。
//
// 只在「Tauri 环境 + 非 DEV」时启用；DEV 态仍走 vite 代理，避免相对路径 /api 无法被 Rust 侧解析。
import { fetch } from '@tauri-apps/plugin-http'
import {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'

function buildUrl(config: InternalAxiosRequestConfig): string {
  let url = config.url ?? ''

  // 拼接 baseURL（仅当 url 不是绝对地址时）
  if (
    config.baseURL &&
    !/^([a-z][a-z0-9+.-]*:)?\/\//i.test(url)
  ) {
    url = config.baseURL.replace(/\/+$/, '') + '/' + url.replace(/^\/+/, '')
  }

  // 追加 query 参数
  if (config.params) {
    const search = new URLSearchParams(
      config.params as Record<string, string>
    ).toString()
    if (search) {
      url += (url.includes('?') ? '&' : '?') + search
    }
  }
  return url
}

export async function tauriHttpAdapter(
  config: InternalAxiosRequestConfig
): Promise<AxiosResponse> {
  const url = buildUrl(config)

  // 归一化 headers（axios 1.x 的 headers 是 AxiosHeaders，需展开为普通对象）
  const headers: Record<string, string> = {}
  if (config.headers) {
    const raw = (config.headers as any).toJSON
      ? (config.headers as any).toJSON()
      : config.headers
    for (const [k, v] of Object.entries(raw)) {
      if (v !== null && v !== undefined) headers[k] = String(v)
    }
  }

  // body：默认 transformRequest 已把对象 JSON 序列化，这里仅兜底处理
  let body: any
  if (config.data !== null && config.data !== undefined) {
    if (
      typeof config.data === 'string' ||
      config.data instanceof FormData ||
      config.data instanceof Blob ||
      config.data instanceof URLSearchParams ||
      config.data instanceof ArrayBuffer
    ) {
      body = config.data
    } else {
      body = JSON.stringify(config.data)
      if (!headers['Content-Type'] && !headers['content-type']) {
        headers['Content-Type'] = 'application/json'
      }
    }
  }

  const response = await fetch(url, {
    method: (config.method || 'get').toUpperCase(),
    headers,
    body,
  })

  const status = response.status
  const statusText = response.statusText

  const responseHeaders: Record<string, string> = {}
  response.headers.forEach((value, key) => {
    responseHeaders[key] = value
  })

  const responseType = config.responseType || 'json'
  let data: any
  if (responseType === 'arraybuffer') {
    data = await response.arrayBuffer()
  } else if (responseType === 'blob') {
    data = await response.blob()
  } else if (responseType === 'text') {
    data = await response.text()
  } else {
    const text = await response.text()
    try {
      data = text ? JSON.parse(text) : null
    } catch {
      data = text
    }
  }

  const axiosResponse: AxiosResponse = {
    data,
    status,
    statusText,
    headers: responseHeaders as any,
    config,
  } as AxiosResponse

  // 按 axios 语义处理非 2xx：构造 AxiosError 交给响应拦截器统一处理
  const validateStatus =
    config.validateStatus || ((s: number) => s >= 200 && s < 300)
  if (!validateStatus(status)) {
    throw new AxiosError(
      `Request failed with status code ${status}`,
      status >= 400 && status < 500
        ? AxiosError.ERR_BAD_REQUEST
        : AxiosError.ERR_BAD_RESPONSE,
      config,
      null,
      axiosResponse
    )
  }

  return axiosResponse
}
