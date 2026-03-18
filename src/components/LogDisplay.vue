<template>
  <div class="log-display">
    <!-- 日志工具栏 -->
    <div class="log-toolbar">
      <div class="toolbar-left">
        <select v-model="levelFilter" class="filter-select">
          <option value="all">全部级别</option>
          <option value="info">Info</option>
          <option value="warn">Warn</option>
          <option value="error">Error</option>
          <option value="debug">Debug</option>
        </select>
        
        <input 
          v-model="searchTerm" 
          type="text" 
          placeholder="搜索日志..." 
          class="search-input"
        />
        
        <button @click="clearLogs" class="btn-clear">清空</button>
      </div>
      
      <div class="toolbar-right">
        <button @click="toggleAutoScroll" :class="['btn-auto-scroll', { active: autoScroll }]">
          {{ autoScroll ? '自动滚动' : '暂停滚动' }}
        </button>
        <button @click="exportLogs" class="btn-export">导出</button>
      </div>
    </div>
    
    <!-- 日志内容区域 -->
    <div ref="logContainer" class="log-container" @scroll="handleScroll">
      <div 
        v-for="(log, index) in filteredLogs" 
        :key="index" 
        :class="['log-entry', `log-${log.level.toLowerCase()}`]"
      >
        <div class="log-time">{{ formatTime(log.timestamp) }}</div>
        <div class="log-level">{{ log.level.toUpperCase() }}</div>
        <div class="log-content" v-html="formatMessage(log.message)"></div>
      </div>
      
      <div v-if="filteredLogs.length === 0" class="no-logs">
        暂无日志数据
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'

// 定义日志类型
interface LogEntry {
  timestamp: Date | string;
  level: string | 'info' | 'warn' | 'error' | 'debug';
  message: string;
}

// Props
interface Props {
  logs?: LogEntry[];
  maxLogs?: number;
}

const props = withDefaults(defineProps<Props>(), {
  logs: () => [],
  maxLogs: 1000
})

// 状态
const levelFilter = ref('all')
const searchTerm = ref('')
const autoScroll = ref(true)
const isScrolledToBottom = ref(true)
const logContainer = ref<HTMLDivElement>()

// 过滤后的日志
const filteredLogs = computed(() => {
  return props.logs.filter(log => {
    // 级别过滤
    const levelMatch = levelFilter.value === 'all' || log.level === levelFilter.value
    
    // 搜索过滤
    const searchMatch = !searchTerm.value || 
      log.message.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      log.level.toLowerCase().includes(searchTerm.value.toLowerCase())
    
    return levelMatch && searchMatch
  })
})

// 监听日志变化，自动滚动到底部
watch(
  () => filteredLogs.value.length,
  async () => {
    if (autoScroll.value && isScrolledToBottom.value) {
      await nextTick()
      scrollToBottom()
    }
  }
)

// 格式化时间
const formatTime = (timestamp: Date | string) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour12: false,
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 格式化消息（支持简单标记）
const formatMessage = (message: string) => {
  // 高亮搜索关键词
  if (searchTerm.value) {
    const regex = new RegExp(`(${searchTerm.value})`, 'gi')
    return message.replace(regex, '<mark>$1</mark>')
  }
  return message
}

// 滚动到底部
const scrollToBottom = () => {
  if (logContainer.value) {
    logContainer.value.scrollTop = logContainer.value.scrollHeight
  }
}

// 处理滚动事件
const handleScroll = () => {
  if (logContainer.value) {
    const { scrollTop, scrollHeight, clientHeight } = logContainer.value
    isScrolledToBottom.value = Math.abs(scrollHeight - scrollTop - clientHeight) < 1
  }
}

// 切换自动滚动
const toggleAutoScroll = () => {
  autoScroll.value = !autoScroll.value
  if (autoScroll.value && isScrolledToBottom.value) {
    scrollToBottom()
  }
}

// 清空日志
const clearLogs = () => {
  // 通知父组件清空日志
  emit('clear')
}

// 导出日志
const exportLogs = () => {
  const content = filteredLogs.value.map(log => 
    `${formatTime(log.timestamp)} [${log.level.toUpperCase()}] ${log.message}`
  ).join('\n')
  
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `logs_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

// 事件发射器
const emit = defineEmits<{
  clear: []
}>()
</script>

<style scoped>
.log-display {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.log-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  gap: 12px;
}

.toolbar-left {
  display: flex;
  gap: 8px;
  align-items: center;
}

.toolbar-right {
  display: flex;
  gap: 8px;
}

.filter-select, .search-input {
  padding: 6px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
}

.search-input {
  min-width: 180px;
}

.btn-clear, .btn-auto-scroll, .btn-export {
  padding: 6px 12px;
  border: 1px solid #cbd5e1;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.btn-clear:hover, .btn-export:hover {
  background-color: #f1f5f9;
}

.btn-auto-scroll.active {
  background-color: #10b981;
  color: white;
  border-color: #10b981;
}

.log-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
  background-color: #f9fafb;
  white-space: pre-wrap;
  word-break: break-word;
}

.log-entry {
  display: flex;
  padding: 4px 0;
  border-bottom: 1px solid #f1f5f9;
}

.log-time {
  color: #64748b;
  min-width: 120px;
  flex-shrink: 0;
}

.log-level {
  min-width: 60px;
  flex-shrink: 0;
  font-weight: bold;
}

.log-info .log-level {
  color: #10b981;
}

.log-warn .log-level {
  color: #f59e0b;
}

.log-error .log-level {
  color: #ef4444;
}

.log-debug .log-level {
  color: #3b82f6;
}

.log-content {
  flex: 1;
  color: #1e293b;
}

.no-logs {
  color: #94a3b8;
  text-align: center;
  padding: 40px;
  font-style: italic;
}

/* 高亮搜索结果 */
:deep(mark) {
  background-color: #fef08a;
  color: #1e293b;
  padding: 0 2px;
  border-radius: 2px;
  font-weight: 500;
}
</style>