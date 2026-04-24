import { app, BrowserWindow, ipcMain, dialog, session } from "electron";
import * as path from "path";
import { fileURLToPath } from "url";
import fs from 'fs';
import axios from "axios";

// 解决 __dirname 在 ES 模块中的问题
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import * as iconv from 'iconv-lite';
// 配置文件路径 - 使用 userData 目录，保证软件更新时配置不丢失
const CONFIG_FILE_PATH = path.join(app.getPath('userData'), 'config.json');

// 默认配置
const DEFAULT_CONFIG = {
  serviceUrl: 'http://192.168.9.100:9980',
  xxlJobUrl: 'http://192.168.9.100:38080/xxl-job-admin',
  logFilePath: ''
};

// 读取配置文件
function readConfig(): any {
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const data = fs.readFileSync(CONFIG_FILE_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('读取配置文件失败:', error);
  }
  return DEFAULT_CONFIG;
}

// 保存配置文件
function saveConfig(config: any): boolean {
  try {
    const configData = {
      serviceUrl: config.serviceUrl || DEFAULT_CONFIG.serviceUrl,
      xxlJobUrl: config.xxlJobUrl || DEFAULT_CONFIG.xxlJobUrl,
      logFilePath: config.logFilePath || '',
      xxlUsername: config.xxlUsername || '',
      xxlPassword: config.xxlPassword || ''
    };

    // 确保目录存在
    const configDir = path.dirname(CONFIG_FILE_PATH);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(configData, null, 2), 'utf-8');
    console.log('✅ 配置文件已保存:', CONFIG_FILE_PATH);
    return true;
  } catch (error) {
    console.error('保存配置文件失败:', error);
    return false;
  }
}

// 轮询相关状态
// let pollTimer: NodeJS.Timeout | null = null;
// let lastFileSize = 0;
// let currentWatchPath = '';

function createWindow() {
  const preloadPath = path.join(__dirname, "preload.cjs");
  console.log('💡 Preload 绝对路径:', preloadPath);

  if (!fs.existsSync(preloadPath)) {
    console.error('❌ 错误：preload.cjs 文件不存在！请检查构建过程。');
  }

  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: preloadPath,
      devTools: process.env.NODE_ENV === "development",
    },
    frame: true,
    autoHideMenuBar: true,
    resizable: true,
    icon: path.join(__dirname, "../public/icon.png"),
    backgroundColor: "#f8fafc",
    ...(process.platform === "darwin"
        ? {
          titleBarStyle: "hidden",
          trafficLightPosition: { x: 15, y: 15 },
          vibrancy: "sidebar",
          visualEffectState: "active",
        }
        : {}),
  });

  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
  // mainWindow.webContents.openDevTools();

  return mainWindow;
}

app.whenReady().then(() => {
  // const mainWindow = createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  // --- 配置文件读写 IPC ---
  ipcMain.handle("get-config", async () => {
    console.log("📖 读取配置文件");
    const config = readConfig();
    return { success: true, data: config };
  });

  ipcMain.handle("save-config", async (event: any, config: any) => {
    console.log("💾 保存配置文件:", event, config);
    const success = saveConfig(config);
    return { success, message: success ? "保存成功" : "保存失败" };
  });

  ipcMain.handle("reset-config", async () => {
    console.log("🔄 重置配置文件");
    const success = saveConfig(DEFAULT_CONFIG);
    return {
      success,
      message: success ? "重置成功" : "重置失败",
      data: DEFAULT_CONFIG,
    };
  });

  // // --- 启动轮询监听 ---
  // ipcMain.handle("start-log-watch", async (event: any, logPath: string) => {
  //   // 如果已有定时器，先清除
  //   console.log(event);
  //   if (pollTimer) {
  //     clearInterval(pollTimer);
  //     pollTimer = null;
  //   }
  //
  //   currentWatchPath = logPath;
  //   console.log(`🔄 启动轮询监听: ${logPath}`);
  //
  //   // 初始化文件大小
  //   try {
  //     if (fs.existsSync(logPath)) {
  //       lastFileSize = fs.statSync(logPath).size;
  //       console.log(`📏 初始文件大小: ${lastFileSize} bytes`);
  //     } else {
  //       lastFileSize = 0;
  //       console.log("⚠️ 文件不存在，将从 0 开始监听");
  //     }
  //   } catch (err) {
  //     console.error(`获取初始文件状态失败:`, err);
  //     lastFileSize = 0;
  //   }
  //
  //   // 设置轮询间隔 (例如 500ms)
  //   pollTimer = setInterval(() => {
  //     if (!currentWatchPath || !mainWindow || mainWindow.isDestroyed()) {
  //       return;
  //     }
  //
  //     try {
  //       if (!fs.existsSync(currentWatchPath)) {
  //         // 文件不存在时重置指针或跳过
  //         if (lastFileSize !== 0) {
  //           console.log("⚠️ 文件暂时消失，重置指针");
  //           lastFileSize = 0;
  //         }
  //         return;
  //       }
  //
  //       const stats = fs.statSync(currentWatchPath);
  //       const currentSize = stats.size;
  //
  //       // 情况 1: 文件被清空或重写 (大小变小)
  //       if (currentSize < lastFileSize) {
  //         console.log("📉 文件被重置或清空");
  //         lastFileSize = currentSize;
  //         // 可选：通知前端重置日志列表
  //         // mainWindow.webContents.send('log-file-reset');
  //         return;
  //       }
  //
  //       // 情况 2: 文件有新增内容 (大小变大)
  //       if (currentSize > lastFileSize) {
  //         // ✅ 修改：移除 encoding，改为 Buffer 读取
  //         const stream = fs.createReadStream(currentWatchPath, {
  //           start: lastFileSize,
  //           end: currentSize,
  //         });
  //
  //         let newData = "";
  //         // ✅ 新增：创建转码流
  //         const decoder = iconv.decodeStream('gbk');
  //         stream.pipe(decoder);
  //
  //         // 监听解码后的文本数据
  //         decoder.on('data', (text: string) => {
  //           newData += text;
  //         });
  //
  //         decoder.on('end', () => {
  //           lastFileSize = currentSize; // 更新指针
  //           if (newData.trim()) {
  //             // 发送新增数据给渲染进程
  //             mainWindow.webContents.send("log-file-changed", newData);
  //           }
  //         });
  //
  //         stream.on("error", (err) => {
  //           console.error("读取文件流错误:", err);
  //         });
  //       }
  //       // 情况 3: 大小没变，不做任何操作
  //     } catch (error) {
  //       console.error("轮询检查文件出错:", error);
  //       if (mainWindow && !mainWindow.isDestroyed()) {
  //         mainWindow.webContents.send(
  //           "log-watch-error",
  //           (error as Error).message
  //         );
  //       }
  //     }
  //   }, 500); // 每 500 毫秒检查一次
  //
  //   return { success: true, message: "轮询监听已启动" };
  // });
  //
  // // --- 停止轮询监听 ---
  // ipcMain.handle("stop-log-watch", async () => {
  //   if (pollTimer) {
  //     clearInterval(pollTimer);
  //     pollTimer = null;
  //     currentWatchPath = "";
  //     console.log("⏹️ 轮询监听已停止");
  //     return { success: true, message: "已停止监听" };
  //   }
  //   return { success: true, message: "未在监听" };
  // });

  // --- 窗口控制 IPC (保持原样) ---
  ipcMain.handle("window-minimize", () => {
    const window = BrowserWindow.getFocusedWindow();
    if (window) window.minimize();
  });

  ipcMain.handle("window-maximize", () => {
    const window = BrowserWindow.getFocusedWindow();
    if (window) {
      if (window.isMaximized()) window.unmaximize();
      else window.maximize();
    }
  });

  ipcMain.handle("window-close", () => {
    const window = BrowserWindow.getFocusedWindow();
    if (window) window.close();
  });

  // --- 读取完整日志文件 (保持原样) ---
  ipcMain.handle("read-local-log", async (event: any, filePath: string) => {
    console.log(event);
    try {
      const safePath = path.resolve(filePath);
      if (!fs.existsSync(safePath)) {
        throw new Error("文件不存在");
      }
      // ✅ 修改：读取 Buffer 并使用 iconv 解码 (默认 gbk，如需 utf-8 可改为 'utf-8')
      const buffer = fs.readFileSync(safePath);
      const content = iconv.decode(buffer, 'gbk');

      const lines = content.split(/\r?\n/);
      return { success: true, data: lines };
    } catch (error: any) {
      console.error("读取日志失败:", error);
      return { success: false, error: error.message };
    }
  });

  // --- 文件选择对话框 ---
  ipcMain.handle(
    "select-file",
    async (event: any, options?: Electron.OpenDialogOptions) => {
      const window = BrowserWindow.fromWebContents(event.sender);
      if (!window) {
        return { success: false, error: "无法获取窗口实例" };
      }

      try {
        const result = await dialog.showOpenDialog(window, {
          title: "选择日志文件",
          properties: ["openFile"],
          filters: [
            { name: "日志文件", extensions: ["log", "txt"] },
            { name: "所有文件", extensions: ["*"] },
          ],
          ...options,
        });

        if (result.canceled || result.filePaths.length === 0) {
          return { success: false, canceled: true };
        }

        return {
          success: true,
          filePath: result.filePaths[0],
          fileName: path.basename(result.filePaths[0]),
        };
      } catch (error: any) {
        console.error("文件选择失败:", error);
        return { success: false, error: error.message };
      }
    }
  );

  // 简单的 Cookie 解析辅助函数
  function parseSetCookieHeader(cookieStr: string) {
    const parts = cookieStr.split(";").map((p) => p.trim());
    const [nameValue] = parts;
    const equalIndex = nameValue.indexOf("=");
    if (equalIndex === -1) return null;

    const name = nameValue.substring(0, equalIndex);
    const value = nameValue.substring(equalIndex + 1);

    const attrs: any = { name, value };

    parts.slice(1).forEach((part) => {
      const lowerPart = part.toLowerCase();
      if (lowerPart.startsWith("path=")) attrs.path = part.substring(5);
      else if (lowerPart.startsWith("domain="))
        attrs.domain = part.substring(7);
      else if (lowerPart === "httponly") attrs.httpOnly = true;
      else if (lowerPart === "secure") attrs.secure = true;
      else if (lowerPart.startsWith("samesite=")) {
        const val = part.substring(9).toLowerCase();
        if (["strict", "lax", "none"].includes(val)) attrs.sameSite = val;
      } else if (lowerPart.startsWith("expires="))
        attrs.expirationDate = new Date(part.substring(8)).getTime() / 1000;
      else if (lowerPart.startsWith("max-age=")) {
        const maxAge = parseInt(part.substring(8));
        if (!isNaN(maxAge))
          attrs.expirationDate = Math.floor(Date.now() / 1000) + maxAge;
      }
    });

    return attrs;
  }

  // --- XXL-Job 登录接口（在主进程处理，避免 CORS）---
  ipcMain.handle(
    "xxl-job-login",
    async (event, { baseUrl, userName, password }) => {
      try {
        console.log(`[Main Process] 开始 XXL-Job 登录: ${event} ${baseUrl}`);

        // 1. 发起登录请求
        const response = await axios.post(
          `${baseUrl}/auth/doLogin`,
          new URLSearchParams({ userName, password }),
          {
            headers: {
              "Content-Type":
                "application/x-www-form-urlencoded; charset=UTF-8",
              "X-Requested-With": "XMLHttpRequest",
            },
          }
        );

        // 2. 获取 Set-Cookie
        const setCookieHeaders = response.headers["set-cookie"];
        const ses = session.defaultSession;
        const result = [];
        // 解析 baseUrl 获取协议和主机，用于构造根路径 URL
        let rootUrl = baseUrl;
        try {
          const urlObj = new URL(baseUrl);
          // 构造根路径 URL，例如 http://192.168.1.18:38080/
          rootUrl = `${urlObj.protocol}//${urlObj.host}/`;
        } catch (e) {
          console.error("Invalid baseUrl format:", baseUrl);
        }

        if (setCookieHeaders) {
          const cookies = Array.isArray(setCookieHeaders)
            ? setCookieHeaders
            : [setCookieHeaders];

          for (const cookieStr of cookies) {
            try {
              const cookieDetails = parseSetCookieHeader(cookieStr);
              if (cookieDetails) {
                // 【关键修复点 1】使用根路径 URL，确保所有子路径都能携带 Cookie
                const targetUrl = rootUrl;

                // 准备 Cookie 参数
                const cookieParams: any = {
                  url: targetUrl,
                  name: cookieDetails.name,
                  value: cookieDetails.value,
                  path: "/", // 强制路径为根路径
                  httpOnly: cookieDetails.httpOnly || false,
                  secure: cookieDetails.secure || false,
                  expirationDate: cookieDetails.expirationDate,
                  // 【关键修复点 2】如果是 IP 地址，坚决不设置 domain
                  // 如果是域名，且服务端返回了 domain，则使用服务端的 domain
                };

                // 判断是否为 IP
                const isIpAddr =
                  isIP(cookieDetails.domain || "") ||
                  isIP(new URL(baseUrl).hostname);

                if (!isIpAddr && cookieDetails.domain) {
                  cookieParams.domain = cookieDetails.domain;
                }
                // 如果是 IP，cookieParams.domain 保持 undefined (Host-only)

                console.log(`[Main Process] 正在设置 Cookie:`, cookieParams);

                // 设置 Cookie
                await ses.cookies.set(cookieParams);
                result.push(cookieParams);
                console.log(
                  `[Main Process] ✅ Cookie 设置成功: ${cookieDetails.name}`
                );
              }
            } catch (err) {
              console.error(
                `[Main Process] ❌ 设置 Cookie 失败: ${cookieStr}`,
                err
              );
            }
          }

          // 【验证】读取刚刚设置的 Cookie
          try {
            // 注意：get 的时候也要用同样的 rootUrl
            const storedCookies = await ses.cookies.get({ url: rootUrl });
            console.log("[Main Process] 🔍 验证存储的 Cookies:", storedCookies);
          } catch (e) {
            console.error("[Main Process] 获取 Cookies 失败:", e);
          }
        } else {
          console.warn("[Main Process] ⚠️ 响应中未找到 Set-Cookie 头");
        }

        return result;
      } catch (error: any) {
        console.error("[Main Process] XXL-Job 登录请求失败:", error.message);
        throw error;
      }
    }
  );

  // --- XXL-Job 通用代理接口 ---
   ipcMain.handle(
     "xxl-job-proxy",
     async (event, { url, method = "post", data }) => {
       console.log(`[Main Process] 触发 XXL-Job 代理: ${event} ${url}`);
       const config = readConfig();
       const baseUrl = config.xxlJobUrl; // http://192.168.1.18:38080/xxl-job-admin

       try {
         // 1. 从 Electron Session 中获取所有相关 Cookie
         const ses = session.defaultSession;
         // 获取该域名下的所有 Cookie
         const cookies = await ses.cookies.get({ url: baseUrl });

         // 2. 拼接 Cookie 字符串
         const cookieString = cookies
           .map((c) => `${c.name}=${c.value}`)
           .join("; ");

         console.log(`[Main Process] Proxy Request: ${baseUrl}${url}`);
         console.log(`[Main Process] Using Cookies: ${cookieString || "None"}`);

         // 3. 发起请求，手动带上 Cookie
         const response = await axios({
           url: `${baseUrl}${url}`,
           method: method,
           data: data,
           headers: {
             "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
             "X-Requested-With": "XMLHttpRequest",
             // 手动设置 Cookie 头
             Cookie: cookieString,
           },
          //  validateStatus: function (status) {
          //    return status < 500;
          //  },
         });

         return {
           status: response.status,
           data: response.data,
           headers: response.headers,
         };
       } catch (error: any) {
         console.error("[Main Process] Proxy Error:", error.message);
         throw error;
       }
     }
   );
});

// 辅助函数：判断是否为 IP 地址
function isIP(str: string) {
  const ipRegex = /^(?:\d{1,3}\.){3}\d{1,3}$/;
  return ipRegex.test(str);
}


app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});
