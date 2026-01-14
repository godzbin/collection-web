import { ipcMain as a, BrowserWindow as i, app as n } from "electron";
import * as o from "path";
import { fileURLToPath as s } from "url";
const l = s(import.meta.url), t = o.dirname(l);
function d() {
  const e = new i({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: !0,
      contextIsolation: !1,
      preload: o.join(t, "preload.js"),
      devTools: process.env.NODE_ENV === "development"
    },
    frame: !0,
    // 移除原生窗口框架
    resizable: !0,
    // 可调整大小
    icon: o.join(t, "../public/logo_b_s.png"),
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
  process.env.NODE_ENV === "development" ? (e.loadURL("http://localhost:5173"), e.webContents.openDevTools()) : e.loadFile(o.join(t, "../dist/index.html"));
}
a.handle("window-minimize", () => {
  const e = i.getFocusedWindow();
  e && e.minimize();
});
a.handle("window-maximize", () => {
  const e = i.getFocusedWindow();
  e && (e.isMaximized() ? e.unmaximize() : e.maximize());
});
a.handle("window-close", () => {
  const e = i.getFocusedWindow();
  e && e.close();
});
n.whenReady().then(() => {
  d(), n.on("activate", function() {
    i.getAllWindows().length === 0 && d();
  });
});
n.on("window-all-closed", function() {
  process.platform !== "darwin" && n.quit();
});
