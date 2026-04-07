import { app as p, BrowserWindow as g, ipcMain as l, dialog as z, net as W } from "electron";
import * as i from "path";
import { fileURLToPath as j } from "url";
import r from "fs";
const L = j(import.meta.url), v = i.dirname(L), w = i.join(p.getPath("userData"), "config.json"), y = {
  serviceUrl: "http://192.168.1.169:9980/",
  xxlJobUrl: "http://192.168.1.18:38080/xxl-job-admin",
  logFilePath: ""
};
function N() {
  try {
    if (r.existsSync(w)) {
      const t = r.readFileSync(w, "utf-8");
      return JSON.parse(t);
    }
  } catch (t) {
    console.error("读取配置文件失败:", t);
  }
  return y;
}
function P(t) {
  try {
    const e = {
      serviceUrl: t.serviceUrl || y.serviceUrl,
      xxlJobUrl: t.xxlJobUrl || y.xxlJobUrl,
      logFilePath: t.logFilePath || ""
    }, n = i.dirname(w);
    return r.existsSync(n) || r.mkdirSync(n, { recursive: !0 }), r.writeFileSync(w, JSON.stringify(e, null, 2), "utf-8"), console.log("✅ 配置文件已保存:", w), !0;
  } catch (e) {
    return console.error("保存配置文件失败:", e), !1;
  }
}
let d = null, c = 0, f = "";
function C() {
  const t = i.join(v, "preload.cjs");
  console.log("💡 Preload 绝对路径:", t), r.existsSync(t) || console.error("❌ 错误：preload.cjs 文件不存在！请检查构建过程。");
  const e = new g({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: !0,
      nodeIntegration: !1,
      preload: t,
      devTools: !0
    },
    frame: !0,
    resizable: !0,
    icon: i.join(v, "../public/logo_b_s.png"),
    backgroundColor: "#f8fafc",
    ...process.platform === "darwin" ? {
      titleBarStyle: "hidden",
      trafficLightPosition: { x: 15, y: 15 },
      vibrancy: "sidebar",
      visualEffectState: "active"
    } : {}
  });
  return process.env.NODE_ENV === "development" ? (e.loadURL("http://localhost:5173"), e.webContents.openDevTools()) : e.loadFile(i.join(v, "../dist/index.html")), e.webContents.openDevTools(), e;
}
p.whenReady().then(() => {
  const t = C();
  p.on("activate", function() {
    g.getAllWindows().length === 0 && C();
  }), l.handle("get-config", async () => (console.log("📖 读取配置文件"), { success: !0, data: N() })), l.handle("save-config", async (e, n) => {
    console.log("💾 保存配置文件:", e, n);
    const o = P(n);
    return { success: o, message: o ? "保存成功" : "保存失败" };
  }), l.handle("reset-config", async () => {
    console.log("🔄 重置配置文件");
    const e = P(y);
    return {
      success: e,
      message: e ? "重置成功" : "重置失败",
      data: y
    };
  }), l.handle("start-log-watch", async (e, n) => {
    console.log(e), d && (clearInterval(d), d = null), f = n, console.log(`🔄 启动轮询监听: ${n}`);
    try {
      r.existsSync(n) ? (c = r.statSync(n).size, console.log(`📏 初始文件大小: ${c} bytes`)) : (c = 0, console.log("⚠️ 文件不存在，将从 0 开始监听"));
    } catch (o) {
      console.error("获取初始文件状态失败:", o), c = 0;
    }
    return d = setInterval(() => {
      if (!(!f || !t || t.isDestroyed()))
        try {
          if (!r.existsSync(f)) {
            c !== 0 && (console.log("⚠️ 文件暂时消失，重置指针"), c = 0);
            return;
          }
          const s = r.statSync(f).size;
          if (s < c) {
            console.log("📉 文件被重置或清空"), c = s;
            return;
          }
          if (s > c) {
            const u = r.createReadStream(f, {
              encoding: "utf-8",
              start: c,
              end: s
            });
            let m = "";
            u.on("data", (h) => {
              m += h;
            }), u.on("end", () => {
              c = s, m.trim() && t.webContents.send("log-file-changed", m);
            }), u.on("error", (h) => {
              console.error("读取文件流错误:", h);
            });
          }
        } catch (o) {
          console.error("轮询检查文件出错:", o), t && !t.isDestroyed() && t.webContents.send("log-watch-error", o.message);
        }
    }, 500), { success: !0, message: "轮询监听已启动" };
  }), l.handle("stop-log-watch", async () => d ? (clearInterval(d), d = null, f = "", console.log("⏹️ 轮询监听已停止"), { success: !0, message: "已停止监听" }) : { success: !0, message: "未在监听" }), l.handle("window-minimize", () => {
    const e = g.getFocusedWindow();
    e && e.minimize();
  }), l.handle("window-maximize", () => {
    const e = g.getFocusedWindow();
    e && (e.isMaximized() ? e.unmaximize() : e.maximize());
  }), l.handle("window-close", () => {
    const e = g.getFocusedWindow();
    e && e.close();
  }), l.handle("read-local-log", async (e, n) => {
    console.log(e);
    try {
      const o = i.resolve(n);
      if (!r.existsSync(o))
        throw new Error("文件不存在");
      return { success: !0, data: r.readFileSync(o, "utf-8").split(/\r?\n/) };
    } catch (o) {
      return console.error("读取日志失败:", o), { success: !1, error: o.message };
    }
  }), l.handle("select-file", async (e, n) => {
    const o = g.fromWebContents(e.sender);
    if (!o)
      return { success: !1, error: "无法获取窗口实例" };
    try {
      const s = await z.showOpenDialog(o, {
        title: "选择日志文件",
        properties: ["openFile"],
        filters: [
          { name: "日志文件", extensions: ["log", "txt"] },
          { name: "所有文件", extensions: ["*"] }
        ],
        ...n
      });
      return s.canceled || s.filePaths.length === 0 ? { success: !1, canceled: !0 } : {
        success: !0,
        filePath: s.filePaths[0],
        fileName: i.basename(s.filePaths[0])
      };
    } catch (s) {
      return console.error("文件选择失败:", s), { success: !1, error: s.message };
    }
  }), l.handle("xxl-job-login", async (e, n) => {
    console.log("xxl-job", e);
    const { baseUrl: o, username: s, password: u } = n;
    return console.log("🔐 收到 XXL-Job 登录请求:", o), new Promise((m, h) => {
      const U = new URL(`${o}/auth/doLogin`), x = W.request({
        method: "POST",
        url: U.toString(),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "X-Requested-With": "XMLHttpRequest",
          Referer: `${o}/auth/login`
        }
      });
      let b = "";
      x.on("response", (a) => {
        a.on("data", (S) => {
          b += S;
        }), a.on("end", () => {
          const S = a.headers["set-cookie"];
          console.log("response", a), console.log("📋 响应头 set-cookie:", S);
          let F = null;
          try {
            F = JSON.parse(b);
          } catch {
            console.log("响应体不是 JSON:", b);
          }
          m({
            success: a.statusCode === 200,
            statusCode: a.statusCode,
            data: F,
            cookies: S
          });
        });
      }), x.on("error", (a) => {
        console.error("❌ 登录请求失败:", a), h(a);
      });
      const D = new URLSearchParams({
        userName: s,
        password: u
      });
      x.write(D.toString()), x.end();
    });
  });
});
p.on("window-all-closed", function() {
  process.platform !== "darwin" && p.quit();
});
