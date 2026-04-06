import { app, BrowserWindow, ipcMain, net } from "electron";
import * as path from "path";
import { fileURLToPath } from "url";
import fs from 'fs';

// 解决 __dirname 在 ES 模块中的问题
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置文件路径 - 使用 userData 目录，保证软件更新时配置不丢失
const CONFIG_FILE_PATH = path.join(app.getPath('userData'), 'config.json');

// 默认配置
const DEFAULT_CONFIG = {
  serviceUrl: 'http://192.168.1.169:9980/',
  xxlJobUrl: 'http://192.168.1.18:38080/xxl-job-admin',
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
      logFilePath: config.logFilePath || ''
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
let pollTimer: NodeJS.Timeout | null = null;
let lastFileSize = 0;
let currentWatchPath = '';

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
    resizable: true,
    icon: path.join(__dirname, "../public/logo_b_s.png"),
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

  return mainWindow;
}

app.whenReady().then(() => {
  const mainWindow = createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  // --- 配置文件读写 IPC ---
  ipcMain.handle('get-config', async () => {
    console.log('📖 读取配置文件');
    const config = readConfig();
    return { success: true, data: config };
  });

  ipcMain.handle('save-config', async (event: any, config: any) => {
    console.log('💾 保存配置文件:', event, config);
    const success = saveConfig(config);
    return { success, message: success ? '保存成功' : '保存失败' };
  });

  ipcMain.handle('reset-config', async () => {
    console.log('🔄 重置配置文件');
    const success = saveConfig(DEFAULT_CONFIG);
    return {
      success,
      message: success ? '重置成功' : '重置失败',
      data: DEFAULT_CONFIG
    };
  });


  // --- 启动轮询监听 ---
  ipcMain.handle('start-log-watch', async (event: any, logPath: string) => {
    // 如果已有定时器，先清除
    console.log(event)
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }

    currentWatchPath = logPath;
    console.log(`🔄 启动轮询监听: ${logPath}`);

    // 初始化文件大小
    try {
      if (fs.existsSync(logPath)) {
        lastFileSize = fs.statSync(logPath).size;
        console.log(`📏 初始文件大小: ${lastFileSize} bytes`);
      } else {
        lastFileSize = 0;
        console.log('⚠️ 文件不存在，将从 0 开始监听');
      }
    } catch (err) {
      console.error(`获取初始文件状态失败:`, err);
      lastFileSize = 0;
    }

    // 设置轮询间隔 (例如 500ms)
    pollTimer = setInterval(() => {
      if (!currentWatchPath || !mainWindow || mainWindow.isDestroyed()) {
        return;
      }

      try {
        if (!fs.existsSync(currentWatchPath)) {
          // 文件不存在时重置指针或跳过
          if (lastFileSize !== 0) {
            console.log('⚠️ 文件暂时消失，重置指针');
            lastFileSize = 0;
          }
          return;
        }

        const stats = fs.statSync(currentWatchPath);
        const currentSize = stats.size;

        // 情况 1: 文件被清空或重写 (大小变小)
        if (currentSize < lastFileSize) {
          console.log('📉 文件被重置或清空');
          lastFileSize = currentSize;
          // 可选：通知前端重置日志列表
          // mainWindow.webContents.send('log-file-reset');
          return;
        }

        // 情况 2: 文件有新增内容 (大小变大)
        if (currentSize > lastFileSize) {
          // 读取新增部分
          const stream = fs.createReadStream(currentWatchPath, {
            encoding: 'utf-8',
            start: lastFileSize,
            end: currentSize,
          });

          let newData = '';
          stream.on('data', (chunk) => {
            newData += chunk;
          });

          stream.on('end', () => {
            lastFileSize = currentSize; // 更新指针
            if (newData.trim()) {
              // 发送新增数据给渲染进程
              mainWindow.webContents.send('log-file-changed', newData);
            }
          });

          stream.on('error', (err) => {
            console.error('读取文件流错误:', err);
          });
        }
        // 情况 3: 大小没变，不做任何操作

      } catch (error) {
        console.error('轮询检查文件出错:', error);
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('log-watch-error', (error as Error).message);
        }
      }
    }, 500); // 每 500 毫秒检查一次

    return { success: true, message: '轮询监听已启动' };
  });

  // --- 停止轮询监听 ---
  ipcMain.handle('stop-log-watch', async () => {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
      currentWatchPath = '';
      console.log('⏹️ 轮询监听已停止');
      return { success: true, message: '已停止监听' };
    }
    return { success: true, message: '未在监听' };
  });

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
  ipcMain.handle('read-local-log', async (event: any, filePath: string) => {
    console.log(event)
    try {
      const safePath = path.resolve(filePath);
      if (!fs.existsSync(safePath)) {
        throw new Error('文件不存在');
      }
      const content = fs.readFileSync(safePath, 'utf-8');
      const lines = content.split(/\r?\n/);
      return { success: true, data: lines };
    } catch (error: any) {
      console.error('读取日志失败:', error);
      return { success: false, error: error.message };
    }
  });

  // --- XXL-Job 登录接口（在主进程处理，避免 CORS）---
  ipcMain.handle('xxl-job-login', async (event: any, payload: {
    baseUrl: string;
    username: string;
    password: string;
  }) => {
    console.log('xxl-job', event)
    const { baseUrl, username, password } = payload;

    console.log('🔐 收到 XXL-Job 登录请求:', baseUrl);

    return new Promise((resolve, reject) => {
      const url = new URL(`${baseUrl}/auth/doLogin`);

      const request = net.request({
        method: 'POST',
        url: url.toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest',
          'Referer': `${baseUrl}/auth/login`,
        },
      });

      let responseData = '';

      request.on('response', (response: any) => {
        response.on('data', (chunk: any) => {
          responseData += chunk;
        });

        response.on('end', () => {
          // 从响应头获取 set-cookie
          const setCookies = response.headers['set-cookie'];
          console.log('response', response)
          console.log('📋 响应头 set-cookie:', setCookies);

          // 解析响应体
          let responseBody = null;
          try {
            responseBody = JSON.parse(responseData);
          } catch (e) {
            console.log('响应体不是 JSON:', responseData);
          }

          resolve({
            success: response.statusCode === 200,
            statusCode: response.statusCode,
            data: responseBody,
            cookies: setCookies,
          });
        });
      });

      request.on('error', (error: any) => {
        console.error('❌ 登录请求失败:', error);
        reject(error);
      });

      // 发送表单数据
      const formData = new URLSearchParams({
        userName: username,
        password: password,
      });

      request.write(formData.toString());
      request.end();
    });
  });
});


app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});
