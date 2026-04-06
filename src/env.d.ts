declare module 'element-plus/dist/locale/zh-cn.mjs' {
    import { Language } from 'element-plus';
    const zhCn: Language;
    export default zhCn;
}

declare module '*.vue' {
    import type { DefineComponent } from 'vue';
    const component: DefineComponent<{}, {}, any>;
    export default component;
}

interface Window {
    electronAPI?: {
        ipcRenderer: {
            invoke: (channel: string, ...args: any[]) => Promise<any>;
            on: (channel: string, callback: (...args: any[]) => void) => void;
            removeListener: (channel: string, callback: (...args: any[]) => void) => void;
        };
        minimize: () => Promise<void>;
        maximize: () => Promise<void>;
        close: () => Promise<void>;
        readLog: (filePath: string) => Promise<any>;
        startLogWatch: (filePath: string) => Promise<any>;
        stopLogWatch: () => Promise<any>;
        onLogFileChanged: (callback: (newData: string) => void) => void;
        offLogFileChanged: () => void;
        onLogWatchError: (callback: (error: string) => void) => void;
        offLogWatchError: () => void;
        getConfig: () => Promise<{ success: boolean; data: any; message?: string }>;
        saveConfig: (config: any) => Promise<{ success: boolean; message: string }>;
        resetConfig: () => Promise<{ success: boolean; message: string; data: any }>;
    };
}
