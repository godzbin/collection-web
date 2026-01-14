import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import { fileURLToPath } from "url";

// 解决 __dirname 在 ES 模块中的问题
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, "preload.js"),
      devTools: process.env.NODE_ENV === "development",
    },
    frame: true, // 移除原生窗口框架
    resizable: true, // 可调整大小
    icon: path.join(__dirname, "../public/logo_b_s.png"), // 应用图标
    backgroundColor: "#f8fafc", // 背景色
    // macOS 特定设置
    // 只对 macOS 应用特殊标题栏样式
    ...(process.platform === "darwin"
      ? {
          titleBarStyle: "hidden", // 仅 macOS 隐藏标题栏
          trafficLightPosition: { x: 15, y: 15 }, // macOS 左上角交通灯按钮位置
          vibrancy: "sidebar", // macOS 毛玻璃效果（可选）
          visualEffectState: "active", // macOS 视觉效果状态
        }
      : {}),
  });

  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools(); // 仅开发环境开启
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

// 处理窗口控制 IPC 调用
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

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});
