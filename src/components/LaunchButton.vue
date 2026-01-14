<template>
  <div class="launch-button-container">
    <div 
      class="launch-button" 
      :class="{ loading: isLoading, success: isSuccess }"
      @click="handleLaunch"
    >
      <div v-if="isLoading" class="loading-spinner">
        <div class="spinner"></div>
      </div>
      <div v-else-if="isSuccess" class="success-check">
        ✓
      </div>
      <div v-else class="button-content">
        启动
      </div>
    </div>
    
    <div v-if="showMessage" class="message-toast" :class="{ success: isSuccess, error: hasError }">
      {{ messageText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isLoading = ref(false)
const isSuccess = ref(false)
const showMessage = ref(false)
const hasError = ref(false)
const messageText = ref('')

const handleLaunch = async () => {
  if (isLoading.value) return
  
  isLoading.value = true
  isSuccess.value = false
  hasError.value = false
  showMessage.value = false
  
  try {
    // 模拟启动过程
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // 随机决定成功还是失败
    const isSuccessResult = Math.random() > 0.2 // 80% 成功率
    
    if (isSuccessResult) {
      isSuccess.value = true
      messageText.value = '启动成功！'
      hasError.value = false
    } else {
      messageText.value = '启动失败，请重试'
      hasError.value = true
    }
    
    showMessage.value = true
    
    // 重置状态
    setTimeout(() => {
      isLoading.value = false
      showMessage.value = false
      isSuccess.value = false
      hasError.value = false
    }, 2000)
  } catch (error) {
    isLoading.value = false
    hasError.value = true
    messageText.value = '启动失败，请重试'
    showMessage.value = true
    
    setTimeout(() => {
      showMessage.value = false
      hasError.value = false
    }, 2000)
  }
}
</script>

<style scoped>
.launch-button-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.launch-button {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.launch-button:hover:not(.loading) {
  transform: scale(1.05);
  box-shadow: 0 12px 30px rgba(16, 185, 129, 0.5);
}

.launch-button.loading {
  background: linear-gradient(135deg, #64748b, #475569);
  cursor: wait;
}

.launch-button.success {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}

.button-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.success-check {
  font-size: 36px;
  font-weight: bold;
}

.message-toast {
  position: absolute;
  top: 140px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s ease;
  min-width: 120px;
  text-align: center;
}

.message-toast.show {
  opacity: 1;
  transform: translateY(0);
}

.message-toast.success {
  background-color: #dcfce7;
  color: #166534;
  border: 1px solid #86efac;
}

.message-toast.error {
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}

/* 确保消息在需要时显示 */
.launch-button-container:has(.message-toast.show) .message-toast {
  opacity: 1;
  transform: translateY(0);
}
</style>