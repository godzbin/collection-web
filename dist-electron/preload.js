import { ipcMain, BrowserWindow, app } from "electron";
import * as path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
const __filename$1 = fileURLToPath(import.meta.url);
const __dirname$1 = path.dirname(__filename$1);
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname$1, "preload.cjs"),
      devTools: process.env.NODE_ENV === "development"
    },
    frame: true,
    // 移除原生窗口框架
    resizable: true,
    // 可调整大小
    icon: path.join(__dirname$1, "../public/logo_b_s.png"),
    // 应用图标
    backgroundColor: "#f8fafc",
    // 背景色
    // macOS 特定设置
    // 只对 macOS 应用特殊标题栏样式
    ...process.platform === "darwin" ? {
      titleBarStyle: "hidden",
      // 仅 macOS 隐藏标题栏
      trafficLightPosition: { x: 15, y: 15 },
      // macOS 左上角交通灯按钮位置
      vibrancy: "sidebar",
      // macOS 毛玻璃效果（可选）
      visualEffectState: "active"
      // macOS 视觉效果状态
    } : {}
  });
  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname$1, "../dist/index.html"));
  }
}
ipcMain.handle("window-minimize", () => {
  const window = BrowserWindow.getFocusedWindow();
  if (window) {
    window.minimize();
  }
});
ipcMain.handle("window-maximize", () => {
  const window = BrowserWindow.getFocusedWindow();
  if (window) {
    if (window.isMaximized()) {
      window.unmaximize();
    } else {
      window.maximize();
    }
  }
});
ipcMain.handle("window-close", () => {
  const window = BrowserWindow.getFocusedWindow();
  if (window) {
    window.close();
  }
});
app.whenReady().then(() => {
  createWindow();
  app.on("activate", function() {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on("window-all-closed", function() {
  if (process.platform !== "darwin") app.quit();
});
ipcMain.handle("read-local-log", async (event, filePath) => {
  try {
    console.log(event, filePath);
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
