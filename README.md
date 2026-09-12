# 0xa Collection System（Collection 数据采集器）

基于 **Tauri v2** 的桌面端数据采集与任务管理工具。前端保留 Vue 3 业务逻辑，系统级能力由 Rust 侧通过 Tauri Command 提供，替代原 Electron 主进程。

## 项目概览

### 技术栈

| 分层 | 技术 |
| --- | --- |
| 界面 | Vue 3.4 + Element Plus 2.13 + ECharts 6 |
| 构建 | Vite 5 |
| 路由 | vue-router 4（Hash 模式，适配桌面端） |
| 网络 | axios（自定义 adapter 桥接 Tauri HTTP 插件） |
| 桌面框架 | Tauri v2（Rust 2021） |
| 后端能力 | `tauri-plugin-http`、`reqwest`（带 cookie_store） |

### 页面功能

| 路由 | 页面 | 说明 |
| --- | --- | --- |
| `/` | Cockpit | 数据驾驶舱（图表总览） |
| `/taskInfo` | Home | 任务信息 |
| `/taskList` | TaskList | 任务列表与任务配置 |
| `/log` | Log | 运行日志 |
| `/setting` | Setting | 服务地址、XXL-Job 等配置 |
| `/ghPush` | GhPush | 港华推送记录 |
| `/about` | About | 关于 |
| `/login` | Login | 登录（`/login`、`/setting`、`/about` 免登录） |

### 架构要点

前端不直接调用 Node.js，所有系统级操作走 Tauri Command。IPC 适配层位于 `src/api/tauri.ts`：

| 前端调用 | Rust Command | 作用 |
| --- | --- | --- |
| `getConfig()` | `get_config` | 读取配置 |
| `saveConfig(cfg)` | `save_config` | 保存配置 |
| `resetConfig()` | `reset_config` | 重置为默认配置 |
| `xxlJobLogin(...)` | `xxl_job_login` | XXL-Job 登录，Rust 侧保持会话 Cookie |
| `xxlJobProxy(...)` | `xxl_job_proxy` | XXL-Job 请求代理，规避浏览器 CORS |

- **HTTP 绕过 CORS**：生产态下 axios 通过 `src/utils/tauriHttpAdapter.ts` 把传输层切到 Tauri HTTP 插件，请求由 Rust `reqwest` 发出；开发态仍走 Vite 代理。
- **配置文件路径**：写入系统应用数据目录（`app_data_dir()/config.json`）。为兼容 Electron 旧版，首次读取时会回退查找旧版 `userData` 目录（macOS `~/Library/Application Support/<name>/`、Windows `%APPDATA%\<name>\`）。

### 目录结构

```
collection-web-2/
├── src/                    # Vue 前端
│   ├── api/                # 接口封装（含 tauri.ts IPC 适配层）
│   ├── components/         # 公共组件
│   ├── utils/              # request / auth / http adapter
│   ├── views/              # 页面
│   ├── router/             # 路由
│   ├── .env                # VITE_BASE_URL
│   └── main.ts
├── src-tauri/              # Tauri Rust 后端
│   ├── src/
│   │   ├── commands.rs     # IPC 命令实现
│   │   ├── lib.rs          # Builder / 命令注册
│   │   └── main.rs
│   ├── capabilities/       # 权限（含 http 放行）
│   ├── icons/
│   ├── Cargo.toml
│   └── tauri.conf.json     # 应用与打包配置
├── index.html
├── vite.config.ts
└── package.json
```

## 环境要求

| 依赖 | 版本 | 说明 |
| --- | --- | --- |
| Node.js | ≥ 18 | 前端构建 |
| Rust | stable（1.77+） | 通过 [rustup](https://rustup.rs/) 安装 |
| 平台构建工具 | 见下 | Rust 链接所需 |

- **macOS**：Xcode Command Line Tools（`xcode-select --install`）
- **Windows**：Visual Studio 2022 Build Tools，勾选「使用 C++ 的桌面开发」工作负载（含 MSVC 与 Windows SDK）
- **Linux**：`webkit2gtk-4.1`、`libappindicator3` 等 WebKitGTK 依赖

## 启动

### 1. 安装依赖

```bash
npm install
```

### 2. 配置后端地址

编辑 `src/.env`：

```dotenv
VITE_BASE_URL=http://192.168.1.169:9980/
```

开发态的 Vite 代理目标写在 `vite.config.ts` 的 `server.proxy` 中（`/api`、`/xxl-job-admin`），如需切换到其他后端，两处都要改。运行时实际生效的服务地址以应用内「配置管理」页保存的值为准。

### 3. 启动开发模式

```bash
npm run tauri dev
```

该命令会：启动 Vite 开发服务器（固定端口 `5173`）→ 编译 Rust → 打开桌面窗口。

若只需调试前端页面，可单独运行：

```bash
npm run dev        # 浏览器打开 http://localhost:5173
```

> 注意：浏览器环境下 `window.__TAURI_INTERNALS__` 不存在，配置读写与 XXL-Job 代理等能力不可用。

### 4. 前端预览构建产物

```bash
npm run build && npm run preview
```

## 打包

打包由 `tauri build` 完成：先执行 `beforeBuildCommand`（`npm run build`）产出 `dist/`，再编译 Rust release 并生成安装包。

### macOS

```bash
npm run tauri build
```

产物：

```
src-tauri/target/release/bundle/macos/0xa Collection System.app
src-tauri/target/release/bundle/dmg/0xa Collection System_1.0.0_x64.dmg
```

### Windows（x64，NSIS）

需在 **x64 Windows 机器**上构建（`.msi` 依赖 WiX，仅 Windows 可生成；跨平台交叉编译不推荐且易出错）。

```powershell
npm install
npm run tauri build -- --bundles nsis
```

产物：

```
src-tauri\target\release\bundle\nsis\0xa Collection System_1.0.0_x64-setup.exe
```

> `--bundles nsis` 建议显式指定。`tauri.conf.json` 中 `bundle.targets` 为 `all`，在 Windows 上会同时触发 MSI（需临时下载 WiX，较慢且易失败）。

### 打包配置说明

`src-tauri/tauri.conf.json` 关键字段：

| 字段 | 值 | 含义 |
| --- | --- | --- |
| `productName` | `0xa Collection System` | 应用与安装包显示名 |
| `version` | `1.0.0` | 版本号，出现在安装包文件名中 |
| `identifier` | `com.0xa.collection` | 应用唯一标识，决定配置数据存储目录与签名，**发布后不应再改** |
| `bundle.targets` | `all` | 打当前平台全部可用格式 |
| `bundle.windows.webviewInstallMode` | `offlineInstaller` | 内嵌 WebView2 运行时，目标机离线可装（安装包增大约 127MB） |
| `bundle.windows.nsis.installMode` | `currentUser` | 按当前用户安装，不弹 UAC |
| `bundle.windows.nsis.languages` | `SimpChinese`, `English` | 安装向导语言 |

### 打包注意事项

1. **构建机需联网**：`offlineInstaller` 模式下，Tauri 在构建阶段从微软下载 WebView2 运行时并内嵌。目标机可离线，但构建机必须能访问外网。
2. **不要拷贝 `src-tauri/target`**：该目录是平台相关编译产物（体积可达数 GB），换平台构建前应排除，仅拷贝源码。
3. **版本号需保持一致**：安装包命名以 `tauri.conf.json` 的 `version` 为准；`package.json`（0.0.0）与 `src-tauri/Cargo.toml`（0.1.0）目前未同步，不影响功能，建议发布前一并统一。
4. **双安装风险**：若用户已安装 Electron 旧版，Windows「添加/删除程序」可能出现两个条目（两者注册表卸载键不同），必要时需自定义 NSIS 脚本处理覆盖安装。
5. **数据兼容**：`identifier` 一旦变更，配置目录随之改变，老用户配置将不再被读取。

## 开发说明

- 新增系统能力时：在 `src-tauri/src/commands.rs` 添加 `#[tauri::command]`，在 `lib.rs` 的 `invoke_handler` 中注册，再于 `src/api/tauri.ts` 暴露前端方法。
- 涉及 HTTP 域名时，需同步更新 `src-tauri/capabilities/default.json` 中 `http:default` 的 `allow` 列表。
