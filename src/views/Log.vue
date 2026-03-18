
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

<script setup lang="ts">import { ref, onMounted, onUnmounted } from 'vue'
import { ElSwitch } from 'element-plus' // 引入开关组件
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
const watching = ref(false) // 监听状态
const logPath = '/Users/zebinchen/Desktop/log/collect-data.log'; // 日志文件路径

const handleSwitchChange = (val:  string | number | boolean): any => {
  toggleWatch(val)
}

// 清空日志
const handleClearLogs = () => {
  logs.value = []
}

// 定义全局类型以支持 window.electronAPI
declare global {
  interface Window {
    electronAPI: {
      readLog: (path: string) => Promise<{ success: boolean; data?: string[]; error?: string }>;
      startLogWatch: (path: string) => Promise<{ success: boolean; message?: string; error?: string }>;
      stopLogWatch: () => Promise<{ success: boolean; message?: string; error?: string }>;
      onLogFileChanged: (callback: (newData: string) => void) => void;
      offLogFileChanged: () => void;
      onLogWatchError: (callback: (error: string) => void) => void;
      offLogWatchError: () => void;
    }
  }
}

// 解析日志行简单的正则示例 (根据实际日志格式调整)
const parseLogLine = (line: string): LogEntry | null => {
  if (!line.trim()) return null;
  // 示例： 2026-03-23 17:59:53.530  INFO 119156 --- [RMI TCP Connection(5)-192.168.1.169] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Start completed.
  const [date, timestamp, level, ...rest] = line.split(/\s+/);
  if (!timestamp || !level) return null;
  //
  return {
    timestamp: date + ' ' + timestamp,
    level: level, // 默认或从文本解析
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
  watching.value = false; // 停止监听状态
  // 可以弹窗提示用户
};

// 切换监听状态
const toggleWatch = async (shouldWatch :  string | number | boolean) => {
  if (shouldWatch) {
    try {
      const result = await window.electronAPI.startLogWatch(logPath);
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
      const result = await window.electronAPI.stopLogWatch();
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

// 模拟一些日志数据
onMounted(async () => {
  // 初始加载一次日志
  try {
    const result = await window.electronAPI.readLog(logPath);
    if (result.success && result.data) {
      const initialLogs = result.data
          .map(line => parseLogLine(line))
          .filter((log): log is LogEntry => log !== null);
      logs.value = [...initialLogs, ...logs.value];
      if (logs.value.length > maxLogs.value) {
        logs.value = logs.value.slice(-maxLogs.value);
      }
    } else {
      console.error('初始加载失败:', result.error);
    }
  } catch (e) {
    console.error('初始加载 IPC 调用错误', e);
  }

  // 注册事件监听器
  window.electronAPI.onLogFileChanged(handleFileChange);
  window.electronAPI.onLogWatchError(handleWatchError);

  // 如果需要默认开始监听，取消下面的注释
  toggleWatch(true);
});

onUnmounted(() => {
  // 组件卸载时停止监听并移除事件监听器
  if (watching.value) {
    toggleWatch(false);
  }
  window.electronAPI.offLogFileChanged();
  window.electronAPI.offLogWatchError();
});


</script>

<!-- 保持原有的 style 部分不变 -->
<style scoped>.log-view {
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