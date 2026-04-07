import { ipcRenderer, contextBridge,IpcRenderer, } from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },
  // You can expose other APTs you need here.
  // ...
})

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.invoke('window-minimize'),
  maximize: () => ipcRenderer.invoke('window-maximize'),
  close: () => ipcRenderer.invoke('window-close'),
  readLog: (filePath: string) => ipcRenderer.invoke('read-local-log', filePath),
  startLogWatch: (filePath: string) => ipcRenderer.invoke('start-log-watch', filePath),
  stopLogWatch: () => ipcRenderer.invoke('stop-log-watch'),
  selectFile: (options?: any) => ipcRenderer.invoke('select-file', options),
  // 用于接收来自主进程的消息
  onLogFileChanged: (callback: (newData: string) => void) => {
    ipcRenderer.on('log-file-changed', (_, newData) => callback(newData));
  },
  offLogFileChanged: () => {
    ipcRenderer.removeAllListeners('log-file-changed');
  },
  onLogWatchError: (callback: (error: string) => void) => {
    ipcRenderer.on('log-watch-error', (_, error) => callback(error));
  },
  offLogWatchError: () => {
    ipcRenderer.removeAllListeners('log-watch-error');
  },
  // 配置文件管理
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (config: { serviceUrl: string; xxlJobUrl: string; logFilePath: string }) => ipcRenderer.invoke('save-config', JSON.parse(JSON.stringify(config))),
  resetConfig: () => ipcRenderer.invoke('reset-config'),
  ipcRenderer: {
    send: ipcRenderer.send,
    on: ipcRenderer.on,
    off: ipcRenderer.off,
    invoke: ipcRenderer.invoke,
  }
})

declare global {
  interface Window {
    ipcRenderer: IpcRenderer;
    // @ts-ignore
    electronAPI: any;
  }
}
