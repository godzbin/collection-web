<template>
  <div class="log-view">
    <div class="view-header">
      <h2>系统日志</h2>
      <div class="header-actions">
        <span class="log-count">共 {{ logs.length }} 条日志</span>
        <el-switch
            v-model="watching"
            active-text="监听中"
            inactive-text="未监听"
            @change="handleSwitchChange"
        />
      </div>
    </div>
    <LogDisplay
        :logs="logs"
        :max-logs="maxLogs"
        @clear="handleClearLogs"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElSwitch, ElMessage } from 'element-plus'
import LogDisplay from '../components/LogDisplay.vue'

// 日志类型定义
interface LogEntry {
  timestamp: Date | string;
  level: string | 'info' | 'warn' | 'error' | 'debug';
  message: string;
}

// 状态
const logs = ref<LogEntry[]>([])
const maxLogs = ref(1000)
const watching = ref(false)
const logPath = ref('')

const handleSwitchChange = (val:  string | number | boolean): any => {
  toggleWatch(val)
}

// 清空日志
const handleClearLogs = () => {
  logs.value = []
}

// // 定义全局类型以支持 window.electronAPI
// declare global {
//   interface Window {
//     electronAPI: {
//       readLog: (path: string) => Promise<{ success: boolean; data?: string[]; error?: string }>;
//       startLogWatch: (path: string) => Promise<{ success: boolean; message?: string; error?: string }>;
//       stopLogWatch: () => Promise<{ success: boolean; message?: string; error?: string }>;
//       onLogFileChanged: (callback: (newData: string) => void) => void;
//       offLogFileChanged: () => void;
//       onLogWatchError: (callback: (error: string) => void) => void;
//       offLogWatchError: () => void;
//       getConfig: () => Promise<{ success: boolean; data: any; message?: string }>;
//     }
//   }
// }

// 解析日志行简单的正则示例 (根据实际日志格式调整)
const parseLogLine = (line: string): LogEntry | null => {
  if (!line.trim()) return null;
  const [date, timestamp, level, ...rest] = line.split(/\s+/);
  if (!timestamp || !level) return null;

  return {
    timestamp: date + ' ' + timestamp,
    level: level,
    message: rest.join(' ')
  };
};

// 处理文件变化事件
const handleFileChange = (newData: string) => {
  console.log('文件变化:', newData);
  const lines = newData.split(/\r?\n/).filter(line => line.trim() !== '');
  const newLogs = lines
      .map(line => parseLogLine(line))
      .filter((log): log is LogEntry => log !== null);

  if (newLogs.length > 0) {
    logs.value = [...logs.value, ...newLogs];
    // 限制数量
    if (logs.value.length > maxLogs.value) {
      logs.value = logs.value.slice(-maxLogs.value);
    }
  }
};

// 处理监听错误事件
const handleWatchError = (errorMessage: string) => {
  console.error('日志监听错误:', errorMessage);
  watching.value = false;
};

// 切换监听状态
const toggleWatch = async (shouldWatch :  string | number | boolean) => {
  if (shouldWatch) {
    try {
      const result = await window.electronAPI?.startLogWatch(logPath.value);
      if (result.success) {
        console.log(result.message);
        watching.value = true;
      } else {
        console.error('启动监听失败:', result.error);
        watching.value = false;
      }
    } catch (e) {
      console.error('IPC 调用错误', e);
      watching.value = false;
    }
  } else {
    try {
      const result = await window.electronAPI?.stopLogWatch();
      if (result.success) {
        console.log(result.message);
        watching.value = false;
      } else {
        console.error('停止监听失败:', result.error);
      }
    } catch (e) {
      console.error('IPC 调用错误', e);
    }
  }
};

// 加载配置并初始化
onMounted(async () => {
  try {
    // 从 APP 配置获取日志路径
    if (window.electronAPI) {
      const configResult = await window.electronAPI.getConfig();
      if (configResult.success && configResult.data?.logFilePath) {
        logPath.value = configResult.data.logFilePath;
        console.log('✅ 从配置加载日志路径:', logPath.value);
      } else {
        ElMessage.warning('未配置日志文件路径，请在设置中配置');
        return;
      }
    } else {
      ElMessage.error('非 Electron 环境，无法读取配置');
      return;
    }

    // 初始加载一次日志
    try {
      const result = await window.electronAPI.readLog(logPath.value);
      if (result.success && result.data) {
        const initialLogs = result.data
            .map((line:any) => parseLogLine(line))
            .filter((log: LogEntry): log is LogEntry => log !== null);
        logs.value = [...initialLogs, ...logs.value];
        if (logs.value.length > maxLogs.value) {
          logs.value = logs.value.slice(-maxLogs.value);
        }
      } else {
        console.error('初始加载失败:', result.error);
        ElMessage.error('读取日志文件失败: ' + result.error);
      }
    } catch (e) {
      console.error('初始加载 IPC 调用错误', e);
      ElMessage.error('读取日志文件出错');
    }

    // 注册事件监听器
    window.electronAPI.onLogFileChanged(handleFileChange);
    window.electronAPI.onLogWatchError(handleWatchError);

    // 自动开始监听
    toggleWatch(true);

  } catch (error) {
    console.error('初始化日志组件失败:', error);
    ElMessage.error('初始化日志组件失败');
  }
});

onUnmounted(() => {
  // 组件卸载时停止监听并移除事件监听器
  if (watching.value) {
    toggleWatch(false);
  }
  window.electronAPI?.offLogFileChanged();
  window.electronAPI?.offLogWatchError();
});


</script>

<style scoped>
.log-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e2e8f0;
}

.view-header h2 {
  color: #1e293b;
  margin: 0;
  font-size: 1.5rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.log-count {
  color: #64748b;
  font-size: 0.9rem;
}
</style>
