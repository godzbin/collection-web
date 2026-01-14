<template>
  <div class="about-page">
    <div class="header">
      <div class="logo-container">
        <div class="logo">
					<img src="../assets/logo_b.png" alt="">
				</div>
        <h1 class="app-title">0xa Collection System</h1>
      </div>
    </div>
    
    <div class="content">
      <div class="intro-section">
        <h2>关于我们</h2>
        <p>
          0xa Collection System 是一款专业的数据采集工具，专注于高效、稳定的数据收集和处理。
          我们致力于为用户提供可靠的数据采集解决方案，帮助用户轻松获取所需数据。
        </p>
      </div>
      
      <div class="features-section">
        <h3>核心功能</h3>
        <ul>
          <li>高效的定时数据采集</li>
          <li>灵活的采集频率设置</li>
          <li>实时运行状态监控</li>
          <li>直观的数据可视化</li>
          <li>可靠的错误处理机制</li>
        </ul>
      </div>
      
      <!-- <div class="tech-section">
        <h3>技术栈</h3>
        <div class="tech-stack">
          <span class="tech-tag">Vue 3</span>
          <span class="tech-tag">Electron</span>
          <span class="tech-tag">TypeScript</span>
          <span class="tech-tag">ECharts</span>
          <span class="tech-tag">Node.js</span>
        </div>
      </div> -->
      
      <div class="contact-section">
        <h3>联系我们</h3>
        <p>如有任何问题或建议，请随时与我们联系：</p>
        <div class="contact-info">
          <!-- <p>邮箱: support@0xa-collection.com</p> -->
          <p>GitHub: github.com/0xa-collection</p>
        </div>
      </div>
    </div>
    
    <div class="footer">
      <p>&copy; 2023-{{ currentYear }} 0xa Collection System. 保留所有权利。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const currentYear = ref(new Date().getFullYear())

onMounted(() => {
  // 可以在这里添加一些初始化逻辑
})
</script>

<style scoped>
.about-page {
  min-height: 100vh;
  background-color: white;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.header {
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
  background-color: #f8fafc;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logo {
  font-size: 2.5rem;
  width: 120px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  /* background: linear-gradient(135deg, #10b981, #059669); */
  color: white;
  border-radius: 5px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.logo img {
  width: 100%;
  height: 100%;
}

.app-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.content {
  flex: 1;
  padding: 30px;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.intro-section, .features-section, .tech-section, .contact-section {
  margin-bottom: 30px;
  padding: 20px;
  border-radius: 12px;
  background-color: #f8fafc;
}

.content h2 {
  color: #1e293b;
  font-size: 1.5rem;
  margin-top: 0;
  margin-bottom: 15px;
}

.content h3 {
  color: #334155;
  font-size: 1.2rem;
  margin-top: 0;
  margin-bottom: 15px;
}

.content p {
  color: #475569;
  line-height: 1.6;
  margin-bottom: 10px;
}

.features-section ul {
  padding-left: 20px;
  color: #475569;
}

.features-section li {
  margin-bottom: 8px;
  line-height: 1.5;
}

.tech-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tech-tag {
  padding: 6px 12px;
  background-color: #10b981;
  color: white;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.contact-info {
  padding: 10px 0 0;
}

.contact-info p {
  margin: 5px 0;
  color: #475569;
  font-weight: 500;
}

.footer {
  padding: 20px;
  text-align: center;
  border-top: 1px solid #e2e8f0;
  background-color: #f8fafc;
  color: #64748b;
  font-size: 0.9rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .about-page {
    padding: 0;
  }
  
  .header {
    padding: 15px;
  }
  
  .logo-container {
    flex-direction: column;
    text-align: center;
  }
  
  .logo {
    width: 50px;
    height: 50px;
    font-size: 2rem;
    margin-bottom: 10px;
  }
  
  .app-title {
    font-size: 1.5rem;
  }
  
  .content {
    padding: 20px 15px;
  }
  
  .intro-section, .features-section, .tech-section, .contact-section {
    padding: 15px;
  }
}
</style>