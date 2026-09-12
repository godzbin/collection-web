mod commands;

use commands::AppState;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .setup(|app| {
            // 共享 HTTP 客户端：开启 cookie_store，用于 XXL-Job 登录态保持
            let http = reqwest::Client::builder().cookie_store(true).build()?;
            app.manage(AppState { http });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_config,
            commands::save_config,
            commands::reset_config,
            commands::xxl_job_login,
            commands::xxl_job_proxy,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
