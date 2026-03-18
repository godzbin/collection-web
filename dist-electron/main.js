import { app as u, BrowserWindow as d, ipcMain as c } from "electron";
import * as f from "path";
import { fileURLToPath as y } from "url";
import s from "fs";
const v = y(import.meta.url), h = f.dirname(v);
let r = null, n = 0, a = "";
function p() {
  const t = f.join(h, "preload.cjs");
  console.log("💡 Preload 绝对路径:", t), s.existsSync(t) || console.error("❌ 错误：preload.cjs 文件不存在！请检查构建过程。");
  const e = new d({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: !0,
      nodeIntegration: !1,
      preload: t,
      devTools: process.env.NODE_ENV === "development"
    },
    frame: !0,
    resizable: !0,
    icon: f.join(h, "../public/logo_b_s.png"),
    backgroundColor: "#f8fafc",
    ...process.platform === "darwin" ? {
      titleBarStyle: "hidden",
      trafficLightPosition: { x: 15, y: 15 },
      vibrancy: "sidebar",
      visualEffectState: "active"
    } : {}
  });
  return process.env.NODE_ENV === "development" ? (e.loadURL("http://localhost:5173"), e.webContents.openDevTools()) : e.loadFile(f.join(h, "../dist/index.html")), e;
}
u.whenReady().then(() => {
  const t = p();
  u.on("activate", function() {
    d.getAllWindows().length === 0 && p();
  }), c.handle("start-log-watch", async (e, i) => {
    console.log(e), r && (clearInterval(r), r = null), a = i, console.log(`🔄 启动轮询监听: ${i}`);
    try {
      s.existsSync(i) ? (n = s.statSync(i).size, console.log(`📏 初始文件大小: ${n} bytes`)) : (n = 0, console.log("⚠️ 文件不存在，将从 0 开始监听"));
    } catch (o) {
      console.error("获取初始文件状态失败:", o), n = 0;
    }
    return r = setInterval(() => {
      if (!(!a || !t || t.isDestroyed()))
        try {
          if (!s.existsSync(a)) {
            n !== 0 && (console.log("⚠️ 文件暂时消失，重置指针"), n = 0);
            return;
          }
          const l = s.statSync(a).size;
          if (l < n) {
            console.log("📉 文件被重置或清空"), n = l;
            return;
          }
          if (l > n) {
            const m = s.createReadStream(a, {
              encoding: "utf-8",
              start: n,
              end: l
            });
            let w = "";
            m.on("data", (g) => {
              w += g;
            }), m.on("end", () => {
              n = l, w.trim() && t.webContents.send("log-file-changed", w);
            }), m.on("error", (g) => {
              console.error("读取文件流错误:", g);
            });
          }
        } catch (o) {
          console.error("轮询检查文件出错:", o), t && !t.isDestroyed() && t.webContents.send("log-watch-error", o.message);
        }
    }, 500), { success: !0, message: "轮询监听已启动" };
  }), c.handle("stop-log-watch", async () => r ? (clearInterval(r), r = null, a = "", console.log("⏹️ 轮询监听已停止"), { success: !0, message: "已停止监听" }) : { success: !0, message: "未在监听" }), c.handle("window-minimize", () => {
    const e = d.getFocusedWindow();
    e && e.minimize();
  }), c.handle("window-maximize", () => {
    const e = d.getFocusedWindow();
    e && (e.isMaximized() ? e.unmaximize() : e.maximize());
  }), c.handle("window-close", () => {
    const e = d.getFocusedWindow();
    e && e.close();
  }), c.handle("read-local-log", async (e, i) => {
    console.log(e);
    try {
      const o = f.resolve(i);
      if (!s.existsSync(o))
        throw new Error("文件不存在");
      return { success: !0, data: s.readFileSync(o, "utf-8").split(/\r?\n/) };
    } catch (o) {
      return console.error("读取日志失败:", o), { success: !1, error: o.message };
    }
  });
});
u.on("window-all-closed", function() {
  process.platform !== "darwin" && u.quit();
});
