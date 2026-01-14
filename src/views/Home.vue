<template>
  <div class="page">
    <div class="page-bg"></div>
    
    <!-- 左侧：运行时长和图表 -->
    <div class="left-panel">
      <!-- 运行时长显示 -->
      <div class="runtime-display">
        <div class="runtime-card">
          <h3>运行时长</h3>
          <p class="runtime-value">{{runTime}}</p>
        </div>
      </div>
      
      <!-- 运行成功率图表 -->
      <div class="chart-display">
        <EchartsComponent 
          :data="successRateData" 
          :labels="labels"
          title="近7日运行成功率"
          line-color="#10b981"
        />
      </div>
    </div>
    
    <!-- 右侧：控制按钮 -->
    <div class="right-panel">
      <div class="control-buttons">
        <button 
          class="btn-launch" 
          :class="{ disabled: isRunning }"
          @click="handleLaunch"
          :disabled="isRunning"
        >
          {{ isRunning ? '启动爬取中...' : '手动启动爬取' }}
        </button>
        <button 
          class="btn-stop" 
          :class="{ disabled: !isRunning }"
          @click="handleStop"
          :disabled="!isRunning"
        >
          停止
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import EchartsComponent from '../components/EchartsComponent.vue'

const collectionSettings = localStorage.getItem('collectionSettings') ? JSON.parse(localStorage.getItem('collectionSettings') || '{}') : {
  "frequency": "*/5 * * * *",
  "startTime": "2023-10-01T00:00:00"
}
const startTime = new Date(collectionSettings.startTime)
const runTime = ref('')
const isRunning = ref(false)

let runtimeIntervalId: number | null = null

// 模拟每日运行成功率数据
const successRateData = ref<number[]>([
  95, 92, 98, 90, 94, 96, 93
])

// 生成最近7天的日期标签
const generateLastSevenDays = (): string[] => {
  const labels: string[] = []
  const today = new Date()
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    
    // 获取月份和日期
    const month = date.getMonth() + 1 // 月份从0开始，需要+1
    const day = date.getDate()
    
    labels.push(`${month}/${day}`)
  }
  
  return labels
}

const labels = ref<string[]>(generateLastSevenDays())

// 计算运行时间的函数
const calculateRunTime = (): string => {
  const now = new Date()
  const diffMs = now.getTime() - startTime.getTime()
  
  // 计算天、小时、分钟、秒
  const totalSeconds = Math.floor(diffMs / 1000)
  const days = Math.floor(totalSeconds / (24 * 3600))
  const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  
  // 格式化输出
  let timeString = ''
  if (days > 0) {
    timeString += `${days}天 `
  }
  timeString += `${hours.toString().padStart(2, '0')}时 ${minutes.toString().padStart(2, '0')}分 ${seconds.toString().padStart(2, '0')}秒`
  
  return timeString
}

// 更新运行时间
const updateRunTime = () => {
  runTime.value = calculateRunTime()
}

// 启动按钮处理
const handleLaunch = () => {
  isRunning.value = true
  // 这里可以添加实际的启动逻辑
  console.log('启动应用')
}

// 停止按钮处理
const handleStop = () => {
  isRunning.value = false
  // 这里可以添加实际的停止逻辑
  console.log('停止应用')
}

// 初始化运行时间
updateRunTime()

// 启动定时器更新运行时间
runtimeIntervalId = window.setInterval(updateRunTime, 1000)

// 组件卸载时清理定时器
onUnmounted(() => {
  if (runtimeIntervalId !== null) {
    clearInterval(runtimeIntervalId)
  }
})
</script>

<style scoped>
.page {
  position: relative;
  width: 100%;
  height: 100vh;
  display: grid;
  grid-template-columns: 2fr 1fr; /* 左侧占2份，右侧占1份 */
  gap: 20px;
  /* padding: 20px; */
  box-sizing: border-box;
  /* background-color: white; */
}

.page-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.1);
  background-size: 100% 100%;
  background-repeat: no-repeat;
  opacity: 0.6;
  filter: blur(22px);
  z-index: -1;
}

.left-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.right-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.runtime-display {
  min-height: 120px;
}

.chart-display {
  /* flex: 1; */
}

.runtime-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  padding: 20px;
  width: 100%;
  height: 100%;
  color: #333;
}

.runtime-card h3 {
  margin: 0 0 10px 0;
  font-size: 1.2em;
  color: #16a34a;
  font-weight: 600;
}

.runtime-value {
  font-size: 1.5em;
  font-weight: bold;
  color: #0f172a;
  margin: 0;
}

.control-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  max-width: 200px;
  margin-top: 45%;
}

.btn-launch, .btn-stop {
  padding: 15px 20px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.btn-launch {
  background-color: #10b981;
  color: white;
}

.btn-stop {
  background-color: #ef4444;
  color: white;
}

.btn-launch:hover:not(.disabled), 
.btn-stop:hover:not(.disabled) {
  opacity: 0.9;
  transform: translateY(-2px);
}

.btn-launch.disabled, 
.btn-stop.disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
  opacity: 0.7;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
  }
  
  .left-panel {
    order: 1;
  }
  
  .right-panel {
    order: 2;
    margin-top: 20px;
  }
}
</style>