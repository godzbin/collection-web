<template>
  <div class="setting-page">
    <h2>系统设置</h2>

    <div class="setting-steps">
      <!-- 第一步：服务地址配置 -->
      <div class="step">
        <div class="step-header">
          <div class="step-number">1</div>
          <div class="step-title">服务地址配置</div>
        </div>
        <div class="step-content">
          <div class="setting-item">
            <label>后端服务地址：</label>
            <input
                v-model="config.serviceUrl"
                type="text"
                placeholder="例如: http://192.168.1.169:9980/"
                class="setting-input"
            />
            <div class="setting-hint">
              <p><strong>说明：</strong></p>
              <p>配置后端 API 服务的完整地址，需包含协议和端口号。</p>
              <p>当前配置：<strong>{{ config.serviceUrl || '未设置' }}</strong></p>
            </div>
          </div>
        </div>
      </div>

      <!-- 第二步：XXL-Job 地址配置 -->
      <div class="step">
        <div class="step-header">
          <div class="step-number">2</div>
          <div class="step-title">XXL-Job 地址配置</div>
        </div>
        <div class="step-content">
          <div class="setting-item">
            <label>XXL-Job 管理后台地址：</label>
            <input
                v-model="config.xxlJobUrl"
                type="text"
                placeholder="例如: http://192.168.1.18:38080/xxl-job-admin"
                class="setting-input"
            />
            <div class="setting-hint">
              <p><strong>说明：</strong></p>
              <p>配置 XXL-Job 调度中心的完整地址。</p>
              <p>当前配置：<strong>{{ config.xxlJobUrl || '未设置' }}</strong></p>
            </div>
          </div>
        </div>
      </div>

      <!-- 第三步：Log 文件地址配置 -->
      <div class="step">
        <div class="step-header">
          <div class="step-number">3</div>
          <div class="step-title">Log 文件地址配置</div>
        </div>
        <div class="step-content">
          <div class="setting-item">
            <label>Log 文件存储路径：</label>
            <input
                v-model="config.logFilePath"
                type="text"
                placeholder="例如: /var/logs/collection/app.log"
                class="setting-input"
            />
            <div class="setting-hint">
              <p><strong>说明：</strong></p>
              <p>请确保应用对该路径有读写权限。</p>
              <p>当前配置：<strong>{{ config.logFilePath || '未设置' }}</strong></p>
            </div>
          </div>
        </div>
      </div>

      <!-- 保存按钮 -->
      <div class="save-section">
        <button @click="handleSave" class="save-btn" :disabled="loading">
          {{ loading ? '保存中...' : '保存设置' }}
        </button>
        <button @click="handleReset" class="reset-btn" :disabled="loading">
          重置为默认
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

interface ConfigType {
  serviceUrl: string
  xxlJobUrl: string
  logFilePath: string
}

// 配置数据
const config = ref<ConfigType>({
  serviceUrl: '',
  xxlJobUrl: '',
  logFilePath: ''
})

const loading = ref(false)

// 加载配置
const loadConfig = async () => {
  try {
    if (window.electronAPI) {
      const result = await window.electronAPI.getConfig()
      if (result.success) {
        config.value = result.data
        console.log('✅ 配置加载成功:', config.value)
      } else {
        console.error('❌ 配置加载失败')
      }
    } else {
      // 非 Electron 环境，使用 localStorage
      const saved = localStorage.getItem('systemConfig')
      if (saved) {
        config.value = JSON.parse(saved)
      }
    }
  } catch (error) {
    console.error('加载配置时出错:', error)
    ElMessage.error('加载配置失败')
  }
}

// 保存配置
const handleSave = async () => {
  // 验证必填项
  if (!config.value.serviceUrl.trim()) {
    ElMessage.warning('请输入后端服务地址')
    return
  }

  if (!config.value.xxlJobUrl.trim()) {
    ElMessage.warning('请输入 XXL-Job 管理后台地址')
    return
  }

  loading.value = true

  try {
    if (window.electronAPI) {
      // Electron 环境，保存到文件
      const result = await window.electronAPI.saveConfig(config.value)
      if (result.success) {
        ElMessage.success('配置已保存')
        // 保存后刷新页面使配置生效
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        ElMessage.error(result.message || '保存失败')
      }
    } else {
      // 非 Electron 环境，使用 localStorage
      localStorage.setItem('systemConfig', JSON.stringify(config.value))
      ElMessage.success('配置已保存')
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    }
  } catch (error) {
    console.error('保存配置时出错:', error)
    ElMessage.error('保存配置失败')
  } finally {
    loading.value = false
  }
}

// 重置配置
const handleReset = async () => {
  try {
    if (window.electronAPI) {
      const result = await window.electronAPI.resetConfig()
      if (result.success) {
        config.value = result.data
        ElMessage.success('已重置为默认配置')
      } else {
        ElMessage.error(result.message || '重置失败')
      }
    } else {
      localStorage.removeItem('systemConfig')
      config.value = {
        serviceUrl: 'http://192.168.1.169:9980/',
        xxlJobUrl: 'http://192.168.1.18:38080/xxl-job-admin',
        logFilePath: ''
      }
      ElMessage.success('已重置为默认配置')
    }
  } catch (error) {
    console.error('重置配置时出错:', error)
    ElMessage.error('重置配置失败')
  }
}

// 组件挂载时加载配置
onMounted(() => {
  loadConfig()
})
</script>

<style scoped>
.setting-page {
  min-height: 100vh;
  overflow: auto;
  padding: 20px;
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

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.setting-item label {
  font-weight: 600;
  color: #1e293b;
}

.setting-input {
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-family: monospace;
  font-size: 0.9rem;
  width: 100%;
  max-width: 500px;
}

.setting-input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
}

.setting-hint {
  margin-top: 8px;
  padding: 12px;
  background-color: #f8fafc;
  border-radius: 6px;
  font-size: 0.85rem;
  border-left: 4px solid #64748b;
}

.setting-hint p {
  margin: 4px 0;
}

.setting-hint strong {
  color: #1e293b;
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

.save-btn:hover:not(:disabled) {
  background-color: #059669;
  transform: translateY(-2px);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.reset-btn {
  background-color: #94a3b8;
  color: white;
}

.reset-btn:hover:not(:disabled) {
  background-color: #64748b;
  transform: translateY(-2px);
}

.reset-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .setting-page {
    padding: 12px;
  }

  .step-content {
    padding: 16px;
  }

  .setting-input {
    max-width: 100%;
  }

  .save-section {
    flex-direction: column;
  }
}
</style>
