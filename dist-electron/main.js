import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
const __filename$1 = fileURLToPath(import.meta.url);
const __dirname$1 = path.dirname(__filename$1);
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
});
app.on("window-all-closed", function() {
  if (process.platform !== "darwin") app.quit();
});
