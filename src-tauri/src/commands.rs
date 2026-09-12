use std::fs;
use std::path::PathBuf;

use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use tauri::{AppHandle, Manager, State};

// 共享状态：持有带 cookie_store 的 HTTP 客户端，用于保持 XXL-Job 登录态
pub struct AppState {
    pub http: reqwest::Client,
}

// 配置结构体。字段序列化为 camelCase，与 Electron 旧版写入的 config.json 字段名
// (serviceUrl / xxlJobUrl / logFilePath / xxlUsername / xxlPassword) 完全一致，保证数据兼容。
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Config {
    pub service_url: String,
    pub xxl_job_url: String,
    #[serde(default)]
    pub log_file_path: String,
    #[serde(default)]
    pub xxl_username: String,
    #[serde(default)]
    pub xxl_password: String,
}

impl Default for Config {
    fn default() -> Self {
        Config {
            service_url: "http://192.168.9.100:9980".to_string(),
            xxl_job_url: "http://192.168.9.100:38080/xxl-job-admin".to_string(),
            log_file_path: String::new(),
            xxl_username: String::new(),
            xxl_password: String::new(),
        }
    }
}

// Tauri 标准数据目录，例如 macOS 下 ~/Library/Application Support/<identifier>/
fn config_path(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    Ok(dir.join("config.json"))
}

// 兼容 Electron 旧版 userData 路径，避免升级后配置丢失。
// config_dir() 在各平台恰好等于 Electron userData 的父目录：
//   macOS:   ~/Library/Application Support
//   Windows: %APPDATA% (Roaming)
//   Linux:   ~/.config
fn legacy_paths(app: &AppHandle) -> Vec<PathBuf> {
    let mut paths = Vec::new();
    if let Ok(base) = app.path().config_dir() {
        for name in ["collection-web", "0xa Collection System"] {
            paths.push(base.join(name).join("config.json"));
        }
    }
    paths
}

fn read_config(app: &AppHandle) -> Config {
    // 1. 优先读取 Tauri 路径
    if let Ok(path) = config_path(app) {
        if let Ok(data) = fs::read_to_string(&path) {
            if let Ok(cfg) = serde_json::from_str::<Config>(&data) {
                return cfg;
            }
        }
    }
    // 2. 回退读取 Electron 旧路径，避免升级后配置丢失
    for path in legacy_paths(app) {
        if let Ok(data) = fs::read_to_string(&path) {
            if let Ok(cfg) = serde_json::from_str::<Config>(&data) {
                return cfg;
            }
        }
    }
    Config::default()
}

fn write_config(app: &AppHandle, config: &Config) -> Result<(), String> {
    let path = config_path(app)?;
    if let Some(dir) = path.parent() {
        fs::create_dir_all(dir).map_err(|e| e.to_string())?;
    }
    let data = serde_json::to_string_pretty(config).map_err(|e| e.to_string())?;
    fs::write(&path, data).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_config(app: AppHandle) -> Result<Value, String> {
    let config = read_config(&app);
    Ok(json!({ "success": true, "data": config }))
}

#[tauri::command]
pub fn save_config(app: AppHandle, config: Config) -> Result<Value, String> {
    write_config(&app, &config)?;
    Ok(json!({ "success": true, "message": "保存成功" }))
}

#[tauri::command]
pub fn reset_config(app: AppHandle) -> Result<Value, String> {
    let default = Config::default();
    write_config(&app, &default)?;
    Ok(json!({ "success": true, "message": "重置成功", "data": default }))
}

// XXL-Job 登录：在主进程发起请求并借助 reqwest cookie_store 保存会话
#[tauri::command]
#[allow(non_snake_case)]
pub async fn xxl_job_login(
    state: State<'_, AppState>,
    baseUrl: String,
    userName: String,
    password: String,
) -> Result<Value, String> {
    let url = format!("{}/auth/doLogin", baseUrl.trim_end_matches('/'));
    let resp = state
        .http
        .post(&url)
        .header("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8")
        .header("X-Requested-With", "XMLHttpRequest")
        .form(&[("userName", userName), ("password", password)])
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let status = resp.status().as_u16();
    if !(200..300).contains(&status) {
        return Err(format!("XXL-Job 登录失败，HTTP 状态码: {}", status));
    }
    Ok(json!({ "success": true }))
}

// XXL-Job 通用代理：读取配置中的 xxlJobUrl，携带会话 Cookie 转发请求，规避 CORS
#[tauri::command]
pub async fn xxl_job_proxy(
    app: AppHandle,
    state: State<'_, AppState>,
    url: String,
    method: Option<String>,
    data: Option<Value>,
) -> Result<Value, String> {
    let config = read_config(&app);
    let base_url = config.xxl_job_url.trim_end_matches('/').to_string();
    let full_url = format!("{}{}", base_url, url);
    // HTTP 方法区分大小写：Method::from_bytes(b"post") 会构造出自定义方法 "post"（非 POST），
    // 服务端会返回 400。这里统一转大写再做解析。
    let method = method
        .unwrap_or_else(|| "post".to_string())
        .to_ascii_uppercase();

    let mut req = state
        .http
        .request(reqwest::Method::from_bytes(method.as_bytes()).map_err(|e| e.to_string())?, &full_url)
        .header("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8")
        .header("X-Requested-With", "XMLHttpRequest");

    if let Some(d) = data {
        if !d.is_null() {
            req = req.form(&d);
        }
    }

    let resp = req.send().await.map_err(|e| e.to_string())?;
    let status = resp.status().as_u16();

    let body: Value = resp.json().await.unwrap_or(Value::Null);

    Ok(json!({ "status": status, "data": body }))
}
