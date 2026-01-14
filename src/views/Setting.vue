<template>
  <div class="setting-page">
    <h2>系统设置</h2>
    
    <div class="setting-steps">
      <!-- 第一步：采集频率设置 -->
      <div class="step">
        <div class="step-header">
          <div class="step-number">1</div>
          <div class="step-title">采集频率设置</div>
        </div>
        <div class="step-content">
          <div class="frequency-options">
            <div 
              v-for="option in frequencyOptions" 
              :key="option.value"
              class="frequency-option"
              :class="{ active: selectedFrequency === option.value }"
              @click="selectFrequency(option.value)"
            >
              <span class="option-label">{{ option.label }}</span>
              <span class="option-desc">{{ option.desc }}</span>
            </div>
            
            <div class="custom-frequency">
              <label>自定义定时器格式：</label>
              <input 
                v-model="customCron" 
                type="text" 
                placeholder="例如: */5 * * * * (每5分钟执行)"
                class="cron-input"
              />
              <div class="cron-hint">
                <p><strong>Cron 格式说明：</strong></p>
                <p><code>* * * * *</code> - 分钟 小时 日 月 星期</p>
                <p>例如：<code>*/5 * * * *</code> 表示每5分钟执行一次</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 第二步：采集开始时间设置 -->
      <div class="step">
        <div class="step-header">
          <div class="step-number">2</div>
          <div class="step-title">设置采集开始时间</div>
        </div>
        <div class="step-content">
          <div class="datetime-picker">
            <label>选择开始时间：</label>
            <input 
              v-model="startTime" 
              type="datetime-local" 
              class="datetime-input"
            />
            <div class="current-time">
              <p>当前设置的开始时间：<strong>{{ formattedStartTime || '未设置' }}</strong></p>
              <p class="time-desc">此时间将作为计算运行时长的起始点</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 保存按钮 -->
      <div class="save-section">
        <button @click="saveSettings" class="save-btn">保存设置</button>
        <button @click="resetSettings" class="reset-btn">重置为默认</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// 定义频率选项
const frequencyOptions = [
  { label: '每分钟', value: '* * * * *', desc: '每分钟执行一次' },
  { label: '每5分钟', value: '*/5 * * * *', desc: '每5分钟执行一次' },
  { label: '每10分钟', value: '*/10 * * * *', desc: '每10分钟执行一次' },
  { label: '每30分钟', value: '*/30 * * * *', desc: '每30分钟执行一次' },
  { label: '每小时', value: '0 * * * *', desc: '每小时执行一次' },
  { label: '每天', value: '0 0 * * *', desc: '每天午夜执行一次' },
  { label: '每周', value: '0 0 * * 0', desc: '每周日凌晨执行一次' }
]

// 状态
const selectedFrequency = ref('* * * * *')
const customCron = ref('')
const startTime = ref('')

// 计算属性：格式化开始时间
const formattedStartTime = computed(() => {
  if (!startTime.value) return null
  const date = new Date(startTime.value)
  return date.toLocaleString('zh-CN')
})

// 选择频率
const selectFrequency = (value: string) => {
  selectedFrequency.value = value
  customCron.value = '' // 清空自定义输入
}

// 保存设置到本地存储
const saveSettings = () => {
  const settings = {
    frequency: customCron.value || selectedFrequency.value,
    startTime: startTime.value
  }
  
  localStorage.setItem('collectionSettings', JSON.stringify(settings))
  alert('设置已保存！')
}

// 重置为默认设置
const resetSettings = () => {
  if (confirm('确定要重置为默认设置吗？')) {
    selectedFrequency.value = '* * * * *'
    customCron.value = ''
    startTime.value = ''
    localStorage.removeItem('collectionSettings')
    alert('已重置为默认设置')
  }
}

// 从本地存储加载设置
const loadSettings = () => {
  const savedSettings = localStorage.getItem('collectionSettings')
  if (savedSettings) {
    try {
      const settings = JSON.parse(savedSettings)
      if (settings.frequency) {
        // 检查是否是预设选项之一
        const presetOption = frequencyOptions.find(opt => opt.value === settings.frequency)
        if (presetOption) {
          selectedFrequency.value = settings.frequency
        } else {
          // 如果是自定义的cron表达式
          customCron.value = settings.frequency
          selectedFrequency.value = '' // 清空预设选项
        }
      }
      if (settings.startTime) {
        startTime.value = settings.startTime
      }
    } catch (e) {
      console.error('加载设置时出错:', e)
    }
  }
}

// 组件挂载时加载设置
onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.setting-page {
  /* padding: 20px; */
  /* background-color: white; */
  min-height: 100vh;
	overflow: auto;
}

.setting-page h2 {
  margin-bottom: 24px;
  color: #1e293b;
  font-size: 1.5rem;
  font-weight: 600;
}

.setting-steps {
  max-width: 800px;
  margin: 0 auto;
}

.step {
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  margin-bottom: 20px;
  overflow: hidden;
}

.step-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background-color: #f1f5f9;
  border-bottom: 1px solid #e2e8f0;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #10b981;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 12px;
}

.step-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
}

.step-content {
  padding: 20px;
}

.frequency-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.frequency-option {
  padding: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.frequency-option:hover {
  border-color: #94a3b8;
  background-color: #f1f5f9;
}

.frequency-option.active {
  border-color: #10b981;
  background-color: #ecfdf5;
}

.option-label {
  display: block;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
}

.option-desc {
  font-size: 0.9rem;
  color: #64748b;
}

.custom-frequency {
  padding: 16px;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  background-color: #f8fafc;
}

.custom-frequency label {
  display: block;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
}

.cron-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-family: monospace;
  font-size: 0.9rem;
}

.cron-input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
}

.cron-hint {
  margin-top: 12px;
  padding: 12px;
  background-color: #f1f5f9;
  border-radius: 6px;
  font-size: 0.85rem;
}

.cron-hint code {
  background-color: #e2e8f0;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
}

.datetime-picker {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.datetime-picker label {
  font-weight: 600;
  color: #1e293b;
}

.datetime-input {
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  width: 250px;
}

.datetime-input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
}

.current-time {
  margin-top: 16px;
  padding: 12px;
  background-color: #f0fdf4;
  border-left: 4px solid #10b981;
  border-radius: 0 6px 6px 0;
}

.current-time p {
  margin: 4px 0;
}

.time-desc {
  font-size: 0.9rem;
  color: #64748b;
}

.save-section {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  justify-content: center;
}

.save-btn, .reset-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.save-btn {
  background-color: #10b981;
  color: white;
}

.save-btn:hover {
  background-color: #059669;
  transform: translateY(-2px);
}

.reset-btn {
  background-color: #94a3b8;
  color: white;
}

.reset-btn:hover {
  background-color: #64748b;
  transform: translateY(-2px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .setting-page {
    padding: 12px;
  }
  
  .step-content {
    padding: 16px;
  }
  
  .datetime-input {
    width: 100%;
  }
  
  .save-section {
    flex-direction: column;
  }
}
</style>