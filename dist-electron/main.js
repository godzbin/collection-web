import { app, BrowserWindow, ipcMain, dialog, net } from "electron";
import * as path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
const __filename$1 = fileURLToPath(import.meta.url);
const __dirname$1 = path.dirname(__filename$1);
const CONFIG_FILE_PATH = path.join(app.getPath("userData"), "config.json");
const DEFAULT_CONFIG = {
  serviceUrl: "http://192.168.1.169:9980/",
  xxlJobUrl: "http://192.168.1.18:38080/xxl-job-admin",
  logFilePath: ""
};
function readConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const data = fs.readFileSync(CONFIG_FILE_PATH, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("读取配置文件失败:", error);
  }
  return DEFAULT_CONFIG;
}
function saveConfig(config) {
  try {
    const configData = {
      serviceUrl: config.serviceUrl || DEFAULT_CONFIG.serviceUrl,
      xxlJobUrl: config.xxlJobUrl || DEFAULT_CONFIG.xxlJobUrl,
      logFilePath: config.logFilePath || ""
    };
    const configDir = path.dirname(CONFIG_FILE_PATH);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(configData, null, 2), "utf-8");
    console.log("✅ 配置文件已保存:", CONFIG_FILE_PATH);
    return true;
  } catch (error) {
    console.error("保存配置文件失败:", error);
    return false;
  }
}
let pollTimer = null;
let lastFileSize = 0;
let currentWatchPath = "";
function createWindow() {
  const preloadPath = path.join(__dirname$1, "preload.cjs");
  console.log("💡 Preload 绝对路径:", preloadPath);
  if (!fs.existsSync(preloadPath)) {
    console.error("❌ 错误：preload.cjs 文件不存在！请检查构建过程。");
  }
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: preloadPath,
      devTools: process.env.NODE_ENV === "development"
    },
    frame: true,
    resizable: true,
    icon: path.join(__dirname$1, "../public/logo_b_s.png"),
    backgroundColor: "#f8fafc",
    ...process.platform === "darwin" ? {
      titleBarStyle: "hidden",
      trafficLightPosition: { x: 15, y: 15 },
      vibrancy: "sidebar",
      visualEffectState: "active"
    } : {}
  });
  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname$1, "../dist/index.html"));
  }
  return mainWindow;
}
app.whenReady().then(() => {
  const mainWindow = createWindow();
  app.on("activate", function() {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
  ipcMain.handle("get-config", async () => {
    console.log("📖 读取配置文件");
    const config = readConfig();
    return { success: true, data: config };
  });
  ipcMain.handle("save-config", async (event, config) => {
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
      data: DEFAULT_CONFIG
    };
  });
  ipcMain.handle("start-log-watch", async (event, logPath) => {
    console.log(event);
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
    currentWatchPath = logPath;
    console.log(`🔄 启动轮询监听: ${logPath}`);
    try {
      if (fs.existsSync(logPath)) {
        lastFileSize = fs.statSync(logPath).size;
        console.log(`📏 初始文件大小: ${lastFileSize} bytes`);
      } else {
        lastFileSize = 0;
        console.log("⚠️ 文件不存在，将从 0 开始监听");
      }
    } catch (err) {
      console.error(`获取初始文件状态失败:`, err);
      lastFileSize = 0;
    }
    pollTimer = setInterval(() => {
      if (!currentWatchPath || !mainWindow || mainWindow.isDestroyed()) {
        return;
      }
      try {
        if (!fs.existsSync(currentWatchPath)) {
          if (lastFileSize !== 0) {
            console.log("⚠️ 文件暂时消失，重置指针");
            lastFileSize = 0;
          }
          return;
        }
        const stats = fs.statSync(currentWatchPath);
        const currentSize = stats.size;
        if (currentSize < lastFileSize) {
          console.log("📉 文件被重置或清空");
          lastFileSize = currentSize;
          return;
        }
        if (currentSize > lastFileSize) {
          const stream = fs.createReadStream(currentWatchPath, {
            encoding: "utf-8",
            start: lastFileSize,
            end: currentSize
          });
          let newData = "";
          stream.on("data", (chunk) => {
            newData += chunk;
          });
          stream.on("end", () => {
            lastFileSize = currentSize;
            if (newData.trim()) {
              mainWindow.webContents.send("log-file-changed", newData);
            }
          });
          stream.on("error", (err) => {
            console.error("读取文件流错误:", err);
          });
        }
      } catch (error) {
        console.error("轮询检查文件出错:", error);
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send("log-watch-error", error.message);
        }
      }
    }, 500);
    return { success: true, message: "轮询监听已启动" };
  });
  ipcMain.handle("stop-log-watch", async () => {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
      currentWatchPath = "";
      console.log("⏹️ 轮询监听已停止");
      return { success: true, message: "已停止监听" };
    }
    return { success: true, message: "未在监听" };
  });
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
  ipcMain.handle("read-local-log", async (event, filePath) => {
    console.log(event);
    try {
      const safePath = path.resolve(filePath);
      if (!fs.existsSync(safePath)) {
        throw new Error("文件不存在");
      }
      const content = fs.readFileSync(safePath, "utf-8");
      const lines = content.split(/\r?\n/);
      return { success: true, data: lines };
    } catch (error) {
      console.error("读取日志失败:", error);
      return { success: false, error: error.message };
    }
  });
  ipcMain.handle("select-file", async (event, options) => {
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
          { name: "所有文件", extensions: ["*"] }
        ],
        ...options
      });
      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, canceled: true };
      }
      return {
        success: true,
        filePath: result.filePaths[0],
        fileName: path.basename(result.filePaths[0])
      };
    } catch (error) {
      console.error("文件选择失败:", error);
      return { success: false, error: error.message };
    }
  });
  ipcMain.handle("xxl-job-login", async (event, payload) => {
    console.log("xxl-job", event);
    const { baseUrl, username, password } = payload;
    console.log("🔐 收到 XXL-Job 登录请求:", baseUrl);
    return new Promise((resolve, reject) => {
      const url = new URL(`${baseUrl}/auth/doLogin`);
      const request = net.request({
        method: "POST",
        url: url.toString(),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "X-Requested-With": "XMLHttpRequest",
          "Referer": `${baseUrl}/auth/login`
        }
      });
      let responseData = "";
      request.on("response", (response) => {
        response.on("data", (chunk) => {
          responseData += chunk;
        });
        response.on("end", () => {
          const setCookies = response.headers["set-cookie"];
          console.log("response", response);
          console.log("📋 响应头 set-cookie:", setCookies);
          let responseBody = null;
          try {
            responseBody = JSON.parse(responseData);
          } catch (e) {
            console.log("响应体不是 JSON:", responseData);
          }
          resolve({
            success: response.statusCode === 200,
            statusCode: response.statusCode,
            data: responseBody,
            cookies: setCookies
          });
        });
      });
      request.on("error", (error) => {
        console.error("❌ 登录请求失败:", error);
        reject(error);
      });
      const formData = new URLSearchParams({
        userName: username,
        password
      });
      request.write(formData.toString());
      request.end();
    });
  });
});
app.on("window-all-closed", function() {
  if (process.platform !== "darwin") app.quit();
});
