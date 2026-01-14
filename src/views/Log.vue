<template>
  <div class="log-view">
    <div class="view-header">
      <h2>系统日志</h2>
      <div class="header-actions">
        <span class="log-count">共 {{ logs.length }} 条日志</span>
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
import { ref, onMounted } from 'vue'
import LogDisplay from '../components/LogDisplay.vue'

// 日志类型定义
interface LogEntry {
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
}

// 状态
const logs = ref<LogEntry[]>([])
const maxLogs = ref(1000)

// 添加日志的函数
const addLog = (level: 'info' | 'warn' | 'error' | 'debug', message: string) => {
  logs.value.push({
    timestamp: new Date(),
    level,
    message
  })
  
  // 限制日志数量
  if (logs.value.length > maxLogs.value) {
    logs.value.shift()
  }
}

// 清空日志
const handleClearLogs = () => {
  logs.value = []
}

// 模拟一些日志数据
onMounted(() => {
  // 添加一些示例日志
  setTimeout(() => {
    addLog('info', '应用程序启动成功')
    addLog('info', '连接到 服务器: http://192.168.1.18:1883')
    addLog('info', '订阅数据项: data/*')
    addLog('warn', '连接超时，正在重试...')
    addLog('error', '无法连接到远程服务器')
    addLog('debug', '调试信息: 数据包序列号 12345')
    addLog('info', '收到消息')
    addLog('info', '状态更新: online')
  }, 100)
})

// 提供全局日志记录方法
defineExpose({
  addLog
})
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